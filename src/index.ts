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
  let tick = 0
  const playerSpeed = 2
  let playerNextTick = 0

  type Monster = { x: number; y: number; char: string; speed: number; nextTick: number }
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
    // assign default speed and schedule
    const speed = 4
    const mon: Monster = { x: mx, y: my, char: ch, speed, nextTick: tick + speed }
    monsters.push(mon)
    screen.setCell(mx, my, ch)
  }

  const processTick = () => {
    tick++
    // advance monster internal timers; placeholder for future monster actions
    for (const m of monsters) {
      if (tick >= m.nextTick) {
        m.nextTick = tick + m.speed
        // future movement/AI would go here
      }
    }
  }

  const handleMovement = (dx: number, dy: number) => {
    if (tick >= playerNextTick) {
      const nx = Math.max(0, Math.min(cols - 1, px + dx))
      const ny = Math.max(0, Math.min(gameRows - 1, py + dy))
      // apply movement only if position changes
      if (nx !== px || ny !== py) {
        px = nx
        py = ny
        turn++
        playerNextTick = tick + playerSpeed
        while (tick < playerNextTick) processTick()
      }
    }
  }

  process.stdin.on('data', (chunk: string) => {
    switch (chunk) {
      // movement keys
      case 'h':
        handleMovement(-1, 0)
        break
      case 'l':
        handleMovement(1, 0)
        break
      case 'k':
        handleMovement(0, -1)
        break
      case 'j':
        handleMovement(0, 1)
        break
      // actions
      case 'm':
        spawnMonster()
        break
      case '\u0003': // ctrl-c
        cleanup()
        process.exit(0)
    }

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

    // update status bar text (show turns and ticks)
    const statusText = `Turns: ${turn} Ticks: ${tick}`.padEnd(60)
    for (let x = 0; x < cols; x++) {
      screen.setCell(x, gameRows + 1, statusText[x])
    }

    // render only changed cells
    screen.render(hideCursor)
  })
}

main()
