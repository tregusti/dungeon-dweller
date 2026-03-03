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

import { ANSI } from './ansi'
import Screen from './screen'

function clearScreen() {
  process.stdout.write(ANSI.clearScreen)
}

function hideCursor() {
  process.stdout.write(ANSI.hideCursor)
}

function showCursor() {
  process.stdout.write(ANSI.showCursor)
}

// main
function main() {
  checkSize(60, 25)
  const cols = 60
  const gameRows = 20
  let px = Math.floor(cols / 2)
  let py = Math.floor(gameRows / 2)

  // create screen buffer
  const screen = new Screen(cols, gameRows + 2) // +2 for status bar at row 21

  // initialize terminal: set raw mode and hide cursor
  process.stdin.setRawMode(true)
  hideCursor()
  clearScreen()

  // initial render
  screen.clear()
  screen.setCell(px, py, '@')
  for (let y = 0; y < gameRows; y++) {
    for (let x = 0; x < cols; x++) {
      if (x !== px || y !== py) {
        screen.setCell(x, y, '.')
      }
    }
  }
  // draw status bar background
  for (let x = 0; x < cols; x++) {
    screen.setCell(x, gameRows + 1, ' ')
  }
  // render initial state
  process.stdout.write(ANSI.clearScreen + ANSI.home)
  screen.render(hideCursor)

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

  type Monster = { x: number; y: number; char: string }
  const monsters: Monster[] = []

  const spawnMonster = () => {
    // choose position not occupied by player or other monsters
    let mx: number, my: number
    do {
      mx = Math.floor(Math.random() * cols)
      my = Math.floor(Math.random() * gameRows)
    } while ((mx === px && my === py) || monsters.some((m) => m.x === mx && m.y === my))
    // pick random character
    const choices = ['x', 'm', 'M', '&', '£']
    const ch = choices[Math.floor(Math.random() * choices.length)]
    const mon: Monster = { x: mx, y: my, char: ch }
    monsters.push(mon)
    screen.setCell(mx, my, ch)
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
        py = Math.min(gameRows - 1, py + 1)
        break
      case 'm':
        spawnMonster()
        // immediate render so user sees the monster even if player doesn't move
        screen.render(hideCursor)
        break
      case '\u0003': // ctrl-c
        cleanup()
        process.exit(0)
    }

    // increment turn
    turn++

    if (px !== prevX || py !== prevY) {
      // check for collision with any monster
      for (let i = 0; i < monsters.length; i++) {
        const m = monsters[i]
        if (px === m.x && py === m.y) {
          // remove monster
          monsters.splice(i, 1)
          break
        }
      }

      // update buffer
      screen.setCell(prevX, prevY, '.')
      screen.setCell(px, py, '@')
      prevX = px
      prevY = py
    }

    // update status bar text
    const statusText = `Turns: ${turn}`.padEnd(60)
    for (let x = 0; x < cols; x++) {
      screen.setCell(x, gameRows + 1, statusText[x])
    }

    // render only changed cells
    screen.render(hideCursor)
  })
}

main()
