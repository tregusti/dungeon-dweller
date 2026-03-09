import { Buffer } from './buffer/Buffer'
import { BufferCompositor } from './buffer/BufferCompositor'
import { Hero } from './Hero'
import { Monster } from './Monster'
import { Terminal } from './terminal/Terminal'
import { Debug } from './Debug'
import { flushBuffer } from './terminal/BufferWriter'
import { Game } from './Game'
import { Position } from './types'

/*
TODO:
- Extract game logic into separate Game class
- Add a status class that manages the status bar buffer
- move entities as property in game class?
- Fix bug in BufferCompositor.
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
  dungeonBuffer.setCell(game.hero.x, game.hero.y, game.hero.char)
  statusBuffer.clear()

  let prevHeroPosition: Position = { x: game.hero.x, y: game.hero.y }
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

    if (
      game.hero.x !== prevHeroPosition.x ||
      game.hero.y !== prevHeroPosition.y
    ) {
      // check for collision with any monster
      for (let i = 0; i < game.entities.monsters.length; i++) {
        const m = game.entities.monsters[i]
        if (game.hero.x === m.x && game.hero.y === m.y) {
          // remove monster
          game.entities.removeMonster(m)
          break
        }
      }
    }

    // update status bar buffer
    const statusText = `Turns: ${game.hero.turns} Ticks: ${game.tick}`.padEnd(
      game.dungeon.width,
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
    const position: Position = { x: 0, y: 0 }
    do {
      position.x = Math.floor(Math.random() * game.dungeon.width)
      position.y = Math.floor(Math.random() * game.dungeon.height)
    } while (
      (position.x === game.hero.x && position.y === game.hero.y) ||
      game.entities.monsters.some(
        (m) => m.x === position.x && m.y === position.y,
      )
    )
    const monster = new Monster(position)
    game.entities.addMonster(monster)
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
    for (const entity of game.entities.all) {
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
    const from: Position = { x: game.hero.x, y: game.hero.y }
    if (game.hero.move(dx, dy, game.dungeon.width, game.dungeon.height)) {
      // mark cells for potential collision check
      dungeonBuffer.clearCell(from.x, from.y)
      dungeonBuffer.setCell(game.hero.x, game.hero.y, game.hero.char)
      prevHeroPosition = { x: from.x, y: from.y }

      // Debug.write(
      //   `Hero from (${from.x}, ${from.y}) to (${game.hero.x}, ${game.hero.y})`.padEnd(
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
