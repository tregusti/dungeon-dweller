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
import { Buffer, Compositor } from './Buffer'
import { ResizeHandler } from './ResizeHandler'
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

  // create buffers: dungeon and status bar
  const dungeonBuffer = new Buffer(cols, gameRows, 0, 0, 0)
  const statusBuffer = new Buffer(cols, 1, 0, gameRows + 1, 1)
  // compositor for all buffers
  const compositor = new Compositor(cols, gameRows + 2, hideCursor)
  compositor.setBuffers([dungeonBuffer, statusBuffer])

  // Redraw function for resize recovery
  function forceRedraw() {
    dungeonBuffer.invalidatePrevious()
    statusBuffer.invalidatePrevious()
    compositor.invalidatePrevious()
    compositor.render()
  }

  // initialize terminal: set raw mode and hide cursor
  process.stdin.setRawMode(true)
  hideCursor()
  clearScreen()

  // initial render
  dungeonBuffer.clear()
  dungeonBuffer.setCell(hero.x, hero.y, hero.char)
  statusBuffer.clear()
  // render initial state
  process.stdout.write(ANSI.clearScreen + ANSI.home)
  compositor.render()

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

  let prevX = hero.x
  let prevY = hero.y
  // handle terminal resize
  const resizeHandler = new ResizeHandler(showCursor, hideCursor, onInput, forceRedraw)
  resizeHandler.attach()

  // removed duplicate prevX/prevY declarations
  let tick = 0
  const monsters: Monster[] = []

  function onInput(chunk: string) {
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
      dungeonBuffer.resetCell(prevX, prevY)
      dungeonBuffer.setCell(hero.x, hero.y, hero.char)
      prevX = hero.x
      prevY = hero.y
    }

    // update status bar buffer
    const statusText = `Turns: ${hero.turns} Ticks: ${tick}`.padEnd(cols)
    for (let x = 0; x < cols; x++) {
      statusBuffer.setCell(x, 0, statusText[x])
    }

    // render all buffers in z-order
    compositor.render()
  }

  process.stdin.resume()
  process.stdin.setEncoding('utf8')

  const spawnMonster = () => {
    // choose position not occupied by hero or other monsters
    let mx: number, my: number
    do {
      mx = Math.floor(Math.random() * cols)
      my = Math.floor(Math.random() * gameRows)
    } while ((mx === hero.x && my === hero.y) || monsters.some((m) => m.x === mx && m.y === my))
    const monster = new Monster(mx, my, tick)
    monsters.push(monster)
    dungeonBuffer.setCell(monster.x, monster.y, monster.char)
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

  // input is now handled by onInput via ResizeHandler
}

main()
