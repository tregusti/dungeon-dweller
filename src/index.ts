import { BufferCompositor } from './buffer/BufferCompositor'
import { Hero } from './entities/Hero'
import { Monster } from './entities/Monster'
import { Terminal } from './terminal/Terminal'
import { Debug } from './Debug'
import { flushBuffer } from './terminal/BufferWriter'
import { Game } from './Game'
import { Position } from './types'
import { Buffer } from './buffer/Buffer'

/*
TODO:
- Extract game logic into separate Game class
- Add a status class that manages the status bar buffer
- move entities as property in game class?
- Fix bug in BufferCompositor.
- PRNG see https://gemini.google.com/share/49c3dda200ae
*/

const game = new Game({
  dungeon: { width: 30, height: 10 },
  status: { width: 30, height: 3 },
})

function main() {
  const terminal = new Terminal(game.width, game.height)
  Debug.initialize({ terminal, game })

  const compositor = new BufferCompositor(game.width, game.height)

  const dungeonBuffer = new Buffer({
    width: game.dungeon.width,
    height: game.dungeon.height,
    x: 0,
    y: 0,
    z: 0,
  })
  const statusBuffer = new Buffer({
    width: game.dungeon.width,
    height: 3,
    x: 0,
    y: game.dungeon.height + 1,
    z: 1,
  })
  compositor.add(dungeonBuffer)
  compositor.add(statusBuffer)

  // IDEA:
  // status manages its own buffer and implements the CompositorRegistrant interface
  // which is a method that compositor invokes and passes the buffer to it when it's registered.
  // const status = new Status({ game })
  // compositor.register(status)

  function forceRedraw() {
    terminal.clear()
    flushBuffer(terminal, compositor)
  }

  // initial render
  dungeonBuffer.clear()
  dungeonBuffer.set(game.hero.x, game.hero.y, game.hero.char)
  statusBuffer.clear()

  let gameEnabled = false

  terminal.on('invalid', () => {
    gameEnabled = false
  })

  terminal.on('valid', () => {
    forceRedraw()
    gameEnabled = true
  })

  function onInput(chunk: string) {
    if (chunk === '\u0003' || chunk === 'q') {
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

    // update status bar buffer
    const statusText =
      `Turns: ${game.hero.turns} Ticks: ${game.tick} Monsters: ${game.hero.kills}`.padEnd(
        game.dungeon.width,
      )
    statusBuffer.text(0, 0, statusText)
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
    const pos: Position = { x: 0, y: 0 }
    do {
      pos.x = Math.floor(Math.random() * game.dungeon.width)
      pos.y = Math.floor(Math.random() * game.dungeon.height)
    } while (
      (pos.x === game.hero.x && pos.y === game.hero.y) ||
      game.entities.monsters.some((m) => m.x === pos.x && m.y === pos.y)
    )
    const monster = new Monster(pos)
    game.entities.addMonster(monster)
    dungeonBuffer.set(monster.x, monster.y, monster.char)
  }

  /**
   * Handle a game tick: advance time and update all entities. Entities have a
   * speed that determines how many ticks must pass before they can act again.
   * When an entity acts, its ticksUntilAct is reset based on its speed.
   *
   * @returns {boolean} Whether or not it is the heros turn to act.
   */
  function processTickUntilHeroActs() {
    for (const entity of game.entities.all) {
      if (entity.tick()) {
        // entity is ready to act

        if (entity instanceof Monster) {
          // const action = entity.move()
          // // update monster position in buffer
          // if (action.type === 'move') {
          //   dungeonBuffer.clearCell(action.from.x, action.from.y)
          //   dungeonBuffer.setCell(action.to.x, action.to.y, entity.char)
          // }
        }

        if (entity instanceof Hero) {
          return true
        }
      }
    }
  }

  function handleMovement(dx: number, dy: number) {
    const action = game.hero.move(
      dx,
      dy,
      game.dungeon.width,
      game.dungeon.height,
    )
    if (action.type === 'move') {
      dungeonBuffer.clear(action.from.x, action.from.y)
      dungeonBuffer.set(action.to.x, action.to.y, game.hero.char)

      // check for collision with any monster
      for (let i = 0; i < game.entities.monsters.length; i++) {
        const m = game.entities.monsters[i]
        if (game.hero.x === m.x && game.hero.y === m.y) {
          // remove monster
          game.entities.removeMonster(m)
          game.hero.kills++
          break
        }
      }
      // Debug.write(
      //   `Hero from (${action.from.x}, ${action.from.y}) to (${action.to.x}, ${action.to.y})`.padEnd(
      //     game.size.width,
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
