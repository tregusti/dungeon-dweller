// Simple CLI game where the player can move around an open area using hjkl keys
// verifies terminal size (60x25 minimum)

function checkSize(minCols: number, minRows: number) {
  const cols = process.stdout.columns || 0
  const rows = process.stdout.rows || 0
  if (cols < minCols || rows < minRows) {
    console.error(`Terminal too small: need at least ${minCols}x${minRows}, got ${cols}x${rows}`)
    process.exit(1)
  }
}

import { CLEAR_SCREEN, HIDE_CURSOR, SHOW_CURSOR } from './ansi'

function clearScreen() {
  process.stdout.write(CLEAR_SCREEN)
}

function hideCursor() {
  process.stdout.write(HIDE_CURSOR)
}

function showCursor() {
  process.stdout.write(SHOW_CURSOR)
}

function moveTo(x: number, y: number) {
  // move cursor to (x,y) 0-indexed
  process.stdout.write(`\x1B[${y + 1};${x + 1}H`)
}

function draw(cols: number, rows: number, px: number, py: number) {
  let output = ''
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (x === px && y === py) {
        output += '@' // player
      } else {
        output += '.' // floor
      }
    }
    if (y < rows - 1) output += '\n'
  }
  process.stdout.write(output)
  hideCursor()
}

// main
function main() {
  checkSize(60, 25)
  const cols = process.stdout.columns || 60
  const rows = process.stdout.rows || 25
  let px = Math.floor(cols / 2)
  let py = Math.floor(rows / 2)

  // initialize terminal: set raw mode and hide cursor
  process.stdin.setRawMode(true)
  hideCursor()
  clearScreen()
  draw(cols, rows, px, py)

  // cleanup on exit
  const cleanup = () => {
    showCursor()
    process.stdin.setRawMode(false)
    clearScreen()
  }

  process.on('exit', cleanup)
  process.on('SIGINT', () => {
    cleanup()
    process.exit(0)
  })
  process.on('SIGTERM', () => {
    cleanup()
    process.exit(0)
  })

  process.stdin.resume()
  process.stdin.setEncoding('utf8')
  let prevX = px
  let prevY = py
  let turn = 0
  let spawnTurn = Math.floor(Math.random() * 10) + 1
  let foeX = 0
  let foeY = 0
  let foeActive = false
  let foeSpawned = false

  const trySpawnFoe = () => {
    if (!foeSpawned && turn >= spawnTurn) {
      // pick random position not occupied by player
      do {
        foeX = Math.floor(Math.random() * cols)
        foeY = Math.floor(Math.random() * rows)
      } while (foeX === px && foeY === py)
      foeActive = true
      foeSpawned = true
      moveTo(foeX, foeY)
      process.stdout.write('x')
      hideCursor()
    }
  }

  process.stdin.on('data', (chunk: string) => {
    switch (chunk) {
      case 'h':
        px = Math.max(0, px - 1)
        break
      case 'l':
        px = Math.min(cols - 1, px + 1)
        break
      case 'k':
        py = Math.max(0, py - 1)
        break
      case 'j':
        py = Math.min(rows - 1, py + 1)
        break
      case '\u0003': // ctrl-c
        cleanup()
        process.exit(0)
    }

    // increment turn and maybe spawn foe
    turn++
    trySpawnFoe()

    if (px !== prevX || py !== prevY) {
      // check for collision with foe
      if (foeActive && px === foeX && py === foeY) {
        foeActive = false
        // clear the cell (will be overwritten by @ below)
      }

      // redraw only changed cells
      moveTo(prevX, prevY)
      process.stdout.write('.')
      moveTo(px, py)
      process.stdout.write('@')
      hideCursor()
      prevX = px
      prevY = py
    }
  })
}

main()
