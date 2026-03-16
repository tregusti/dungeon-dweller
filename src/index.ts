import { Buffer } from './buffer/Buffer'
import { BufferCompositor } from './buffer/BufferCompositor'
import { Debug } from './Debug'
import { Monster } from './entities/Monster'
import { Game } from './Game'
import { Status } from './Status'
import { flushBuffer } from './terminal/BufferWriter'
import { Terminal } from './terminal/Terminal'
import { Position } from './types'

/*
TODO:
- Extract game logic into separate Game class
- Add a status class that manages the status bar buffer
- move entities as property in game class?
- Fix bug in BufferCompositor.
- PRNG see https://gemini.google.com/share/49c3dda200ae
*/

const status = new Status({ width: 30, height: 3 })

const game = new Game({
  dungeon: { width: 30, height: 10 },
  status,
})

function main() {
  const terminal = new Terminal(game.width, game.height)
  Debug.initialize({ terminal, game })

  const compositor = new BufferCompositor({
    width: game.width,
    height: game.height,
  })
  const dungeonBuffer = compositor.add({
    buffer: new Buffer({
      width: game.dungeon.width,
      height: game.dungeon.height,
    }),
    x: 0,
    y: 0,
    z: 0,
  })
  compositor.add({
    buffer: status.buffer,
    x: 0,
    y: game.dungeon.height + 1,
    z: 1,
  })

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
  status.update(game)

  let gameEnabled = false

  terminal.on('invalid', () => {
    gameEnabled = false
  })

  terminal.on('valid', () => {
    forceRedraw()
    gameEnabled = true
  })

  terminal.on('input', onInput)

  forceRedraw()
  gameEnabled = true

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

    status.update(game)
    flushBuffer(terminal, compositor)
  }

  function spawnMonster() {
    // choose position not occupied by hero or other monsters
    const pos: Position = { x: 0, y: 0 }
    do {
      pos.x = Math.floor(Math.random() * game.dungeon.width)
      pos.y = Math.floor(Math.random() * game.dungeon.height)
    } while (
      (pos.x === game.hero.x && pos.y === game.hero.y) ||
      game.monsters.all.some((m) => m.x === pos.x && m.y === pos.y)
    )
    const monster = new Monster(pos)
    game.monsters.add(monster)
    dungeonBuffer.set(monster.x, monster.y, monster.char)
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

      game.advanceTurn()

      // check for collision with any monster
      for (let i = 0; i < game.monsters.all.length; i++) {
        const m = game.monsters.all[i]
        if (game.hero.x === m.x && game.hero.y === m.y) {
          // remove monster
          Debug.write(`Hero kills ${m.char} at turn ${game.turns}`)
          game.monsters.remove(m)
          game.hero.kills++
          break
        }
      }
    }

    if (action.type !== 'noop') {
      do {
        game.processMonsterTurn()
        game.hero.giveEnergy()
      } while (game.hero.energy < game.hero.speed)
    }
  }
}

main()
