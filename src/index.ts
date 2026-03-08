import { Buffer } from './buffer/Buffer'
import { BufferCompositor } from './buffer/BufferCompositor'
import { Hero } from './Hero'
import { Monster } from './Monster'
import { EntityCollection } from './EntityCollection'
import { Terminal } from './terminal/Terminal'
import { Debug } from './Debug'
import { flushBuffer } from './terminal/BufferWriter'
import { Game } from './Game'

/*
TODO:
- Extract game logic into separate Game class
- Add FloorSize, GameSize consts
- Size type (x,y)
- Add a status class that manages the status bar buffer
- move entities as property in game class?
- Fix bug in BufferCompositor.
*/

const game = new Game()

const GameSize = {
  width: 30,
  height: 10,
}

// main
function main() {
  const terminal = new Terminal(GameSize.width, GameSize.height)
  Debug.setTerminal(terminal)

  const hero = new Hero(
    Math.floor(GameSize.width / 2),
    Math.floor(GameSize.height / 2),
  )
  const entities = new EntityCollection(hero)

  const compositor = new BufferCompositor(GameSize.width, GameSize.height)

  const dungeonBuffer = new Buffer({
    width: GameSize.width,
    height: GameSize.height,
    offsetX: 0,
    offsetY: 0,
    z: 0,
  })
  const statusBuffer = new Buffer({
    width: GameSize.width,
    height: 3,
    offsetX: 0,
    offsetY: GameSize.height + 1,
    z: 1,
  })
  compositor.add(dungeonBuffer)
  compositor.add(statusBuffer)

  function forceRedraw() {
    terminal.clear()
    flushBuffer(terminal, compositor)
  }

  // initial render
  dungeonBuffer.clear()
  dungeonBuffer.setCell(hero.x, hero.y, hero.char)
  statusBuffer.clear()

  let prevX = hero.x
  let prevY = hero.y
  let gameEnabled = false

  terminal.on('invalid', () => {
    gameEnabled = false
  })

  terminal.on('valid', () => {
    forceRedraw()
    gameEnabled = true
  })

  function onInput(chunk: string) {
    if (chunk === '\u0003') {
      // ctrl-c
      terminal.exit()
    }

    if (!gameEnabled) {
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
    }

    if (hero.x !== prevX || hero.y !== prevY) {
      // check for collision with any monster
      for (let i = 0; i < entities.monsters.length; i++) {
        const m = entities.monsters[i]
        if (hero.x === m.x && hero.y === m.y) {
          // remove monster
          entities.removeMonster(m)
          break
        }
      }
    }

    // update status bar buffer
    const statusText = `Turns: ${hero.turns} Ticks: ${game.tick}`.padEnd(
      GameSize.width,
    )
    statusBuffer.setText(0, 0, statusText)
    flushBuffer(terminal, compositor)
  }

  terminal.on('input', onInput)

  forceRedraw()
  gameEnabled = true
  while (!processTickUntilHeroActs()) {
    game.advance()
  }

  const spawnMonster = () => {
    // choose position not occupied by hero or other monsters
    let mx: number, my: number
    do {
      mx = Math.floor(Math.random() * GameSize.width)
      my = Math.floor(Math.random() * GameSize.height)
    } while (
      (mx === hero.x && my === hero.y) ||
      entities.monsters.some((m) => m.x === mx && m.y === my)
    )
    const monster = new Monster(mx, my)
    entities.addMonster(monster)
    dungeonBuffer.setCell(monster.x, monster.y, monster.char)
  }

  /**
   * Handle a game tick: advance time and update all entities. Entities have a
   * speed that determines how many ticks must pass before they can act again.
   * When an entity acts, its ticksUntilAct is reset based on its speed.
   *
   * @returns {boolean} Whether or not it is the heros turn to act.
   */
  function processTickUntilHeroActs() {
    for (const entity of entities.all) {
      if (entity.tick()) {
        // entity is ready to act

        if (entity instanceof Monster) {
          // simple random movement for monsters
          // const dx = Math.floor(Math.random() * 3) - 1
          // const dy = Math.floor(Math.random() * 3) - 1
          // const nx = Math.max(0, Math.min(cols - 1, entity.x + dx))
          // const ny = Math.max(0, Math.min(gameRows - 1, entity.y + dy))
          // entity.act()
        }

        if (entity instanceof Hero) {
          return true
        }
      }
    }
  }

  function handleMovement(dx: number, dy: number) {
    const oldX = hero.x
    const oldY = hero.y
    if (hero.move(dx, dy, GameSize.width, GameSize.height)) {
      // mark cells for potential collision check
      dungeonBuffer.clearCell(oldX, oldY)
      dungeonBuffer.setCell(hero.x, hero.y, hero.char)
      prevX = oldX
      prevY = oldY

      // Debug.write(
      //   `Hero from (${oldX}, ${oldY}) to (${hero.x}, ${hero.y})`.padEnd(
      //     GameSize.width,
      //   ),
      // )
      while (!processTickUntilHeroActs()) {
        // advance time until it's the heros turn again
        game.advance()
      }
    }
  }
}

main()
