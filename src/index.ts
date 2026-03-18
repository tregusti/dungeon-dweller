import { Buffer } from './buffer/Buffer'
import { BufferCompositor } from './buffer/BufferCompositor'
import { Debug } from './Debug'
import { Monster } from './entities/Monster'
import { Game } from './Game'
import {
  MoveHeroCollisionService,
  MoveHeroCommandHandler,
} from './messaging/commands/MoveHero'
import { Bus } from './messaging/core'
import { EventName } from './messaging/core/Events'
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

  const moveHeroCollisionService = new MoveHeroCollisionService(
    game.dungeon,
    game.monsters,
  )
  const moveHeroCommandHandler = new MoveHeroCommandHandler(
    game.hero,
    moveHeroCollisionService,
    Bus.event,
  )
  Bus.command.register('MoveHero', (payload) =>
    moveHeroCommandHandler.handle(payload),
  )

  Bus.event.subscribe(EventName.HeroMoved, ({ from, to }) => {
    dungeonBuffer.clear(from.x, from.y)
    dungeonBuffer.set(to.x, to.y, game.hero.char)
    game.advanceTurn()
  })

  // Messaging.event.subscribe(
  //   EventName.HeroAttackedMonster,
  //   ({ monsterChar }) => {
  //     Debug.write(`Hero kills ${monsterChar} at turn ${game.turns}`)
  //   },
  // )

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

  async function onInput(chunk: string) {
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
        await handleMovement(-1, 0)
        break
      case 'l':
        await handleMovement(1, 0)
        break
      case 'k':
        await handleMovement(0, -1)
        break
      case 'j':
        await handleMovement(0, 1)
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

  async function handleMovement(dx: number, dy: number) {
    const result = await Bus.command.execute('MoveHero', {
      dx,
      dy,
    })

    if (result.success) {
      do {
        game.processMonsterTurn()
        game.hero.giveEnergy()
      } while (game.hero.energy < game.hero.speed)
    } else {
      if (result.reason === 'wall') {
        Debug.write(`Hero bumps into a wall at turn ${game.turns}`)
      } else if (result.reason === 'monster') {
        Debug.write(
          `Hero bumps into a ${result.monster.char} at turn ${game.turns}`,
        )
      }
    }
  }
}

main()
