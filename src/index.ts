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
import { Hero } from './Hero'
import { Monster } from './Monster'

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
  const hero = new Hero(Math.floor(cols / 2), Math.floor(gameRows / 2))

  // create screen buffer
  const screen = new Screen(cols, gameRows + 2) // +2 for status bar at row 21

  // initialize terminal: set raw mode and hide cursor
  process.stdin.setRawMode(true)
  hideCursor()
  clearScreen()

  // initial render
  screen.clear()
  screen.setCell(hero.x, hero.y, hero.char)
  for (let y = 0; y < gameRows; y++) {
    for (let x = 0; x < cols; x++) {
      if (x !== hero.x || y !== hero.y) {
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

  // pause game when terminal is too small; resume when fixed
  let sizeTooSmall = false
  process.stdout.on('resize', () => {
    const c = process.stdout.columns || 0
    const r = process.stdout.rows || 0
    if (c < 60 || r < 25) {
      sizeTooSmall = true
      // clear everything and show a centered box with live-updating info
      showCursor()
      process.stdout.write(ANSI.clearScreen + ANSI.home)

      const content = [
        'Terminal too small',
        `Dungeon Dweller need at least 60✕25. Currently: ${c}✕${r}`,
        '',
        'Resize the terminal to at least 60✕25 to continue',
      ]

      // compute box dimensions
      const pad = 2
      const maxContentWidth = Math.max(...content.map((s) => s.length))
      const boxWidth = Math.min(c - 4, maxContentWidth + pad * 2)
      const boxHeight = content.length + 2 // top+bottom border
      const startCol = Math.max(1, Math.floor((c - boxWidth) / 2) + 1)
      const startRow = Math.max(1, Math.floor((r - boxHeight) / 2) + 1)

      // draw top border
      const horiz = '-'.repeat(boxWidth - 2)
      process.stdout.write(`\x1B[${startRow};${startCol}H+${horiz}+`)

      // draw content lines
      for (let i = 0; i < content.length; i++) {
        const line = content[i]
        const innerWidth = boxWidth - 2
        const leftPad = Math.floor((innerWidth - line.length) / 2)
        const rightPad = innerWidth - line.length - leftPad
        const text = ' '.repeat(leftPad) + line + ' '.repeat(rightPad)
        process.stdout.write(`\x1B[${startRow + 1 + i};${startCol}H|${text}|`)
      }

      // draw bottom border
      process.stdout.write(`\x1B[${startRow + boxHeight - 1};${startCol}H+${horiz}+`)
    } else {
      // valid size; if we were previously paused, clear the flag
      if (sizeTooSmall) {
        sizeTooSmall = false
      }
      hideCursor()
      process.stdout.write(ANSI.clearScreen + ANSI.home)
      // rebuild buffer from current entities
      screen.clear()
      // floor
      for (let y = 0; y < gameRows; y++) {
        for (let x = 0; x < cols; x++) {
          screen.setCell(x, y, '.')
        }
      }
      // monsters
      for (const m of monsters) {
        screen.setCell(m.x, m.y, m.char)
      }
      // hero
      screen.setCell(hero.x, hero.y, hero.char)
      // status bar
      const statusText = `Turns: ${hero.turns} Ticks: ${tick}`.padEnd(60)
      for (let x = 0; x < cols; x++) {
        screen.setCell(x, gameRows + 1, statusText[x])
      }
      // make sure renderer repaints everything (terminal may have cleared)
      screen.invalidatePrevious()
      screen.render(hideCursor)
    }
  })

  process.stdin.resume()
  process.stdin.setEncoding('utf8')
  let prevX = hero.x
  let prevY = hero.y
  let tick = 0
  const monsters: Monster[] = []

  const spawnMonster = () => {
    // choose position not occupied by hero or other monsters
    let mx: number, my: number
    do {
      mx = Math.floor(Math.random() * cols)
      my = Math.floor(Math.random() * gameRows)
    } while ((mx === hero.x && my === hero.y) || monsters.some((m) => m.x === mx && m.y === my))
    const monster = new Monster(mx, my, tick)
    monsters.push(monster)
    screen.setCell(monster.x, monster.y, monster.char)
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
    if (tick >= hero.nextTick) {
      const oldX = hero.x
      const oldY = hero.y
      if (hero.move(dx, dy, cols, gameRows)) {
        // position changed; advance ticks until hero can move again
        hero.nextTick = tick + hero.speed
        while (tick < hero.nextTick) processTick()
        // mark cells for potential collision check
        prevX = oldX
        prevY = oldY
      }
    }
  }

  process.stdin.on('data', (chunk: string) => {
    // when paused due to small terminal, ignore all keys except ctrl-c
    if (sizeTooSmall) {
      if (chunk === '\u0003') {
        cleanup()
        process.exit(0)
      }
      return
    }

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

    if (hero.x !== prevX || hero.y !== prevY) {
      // check for collision with any monster
      for (let i = 0; i < monsters.length; i++) {
        const m = monsters[i]
        if (hero.x === m.x && hero.y === m.y) {
          // remove monster
          monsters.splice(i, 1)
          break
        }
      }

      // update buffer
      screen.setCell(prevX, prevY, '.') // restore floor char
      screen.setCell(hero.x, hero.y, hero.char)
      prevX = hero.x
      prevY = hero.y
    }

    // update status bar text (show turns and ticks)
    const statusText = `Turns: ${hero.turns} Ticks: ${tick}`.padEnd(60)
    for (let x = 0; x < cols; x++) {
      screen.setCell(x, gameRows + 1, statusText[x])
    }

    // render only changed cells
    screen.render(hideCursor)
  })
}

main()
