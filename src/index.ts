import { Buffer } from './buffer/Buffer'
import { BufferCompositor } from './buffer/BufferCompositor'
import { Debug } from './Debug'
import { MonsterCollection } from './entities/EntityCollection'
import { Hero } from './entities/Hero'
import { Game } from './Game'
import { Dungeon } from './levels/Dungeon'
import { CreateMonsterCommandHandler } from './messaging/commands/CreateMonster'
import {
  MoveHeroCollisionService,
  MoveHeroCommandHandler,
} from './messaging/commands/MoveHero'
import { Bus } from './messaging/core'
import { CommandType } from './messaging/core/Commands'
import { EventType } from './messaging/core/Events'
import { Random } from './Random'
import { Renderer } from './Renderer'
import { Status } from './Status'
import { flushBuffer } from './terminal/BufferWriter'
import { Terminal } from './terminal/Terminal'

const dungeonSize = { width: 20, height: 10 }

const status = new Status({ width: dungeonSize.width, height: 3 })
const hero = new Hero({
  x: Math.floor(dungeonSize.width / 2),
  y: Math.floor(dungeonSize.height / 2),
})
const monsters = new MonsterCollection()
const dungeon = new Dungeon(dungeonSize, hero, monsters)
const game = new Game(dungeon, status, hero, monsters)

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

  const renderer = new Renderer(dungeonBuffer, compositor, terminal)
  renderer.attach()

  // IDEA:
  // status manages its own buffer and implements the CompositorRegistrant interface
  // which is a method that compositor invokes and passes the buffer to it when it's registered.
  // const status = new Status({ game })
  // compositor.register(status)

  /** @deprecated */
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
  Bus.command.register(CommandType.MoveHero, (payload) =>
    moveHeroCommandHandler.handle(payload),
  )

  const createMonsterCommandHandler = new CreateMonsterCommandHandler(
    game.dungeon,
    game.monsters,
    Random,
  )
  Bus.command.register(CommandType.CreateMonster, () =>
    createMonsterCommandHandler.handle(),
  )

  Bus.event.subscribe(EventType.HeroMoved, () => {
    game.advanceTurn()
  })

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
        await handleCreateMonster()
        break
    }

    status.update(game)
  }

  async function handleCreateMonster() {
    const result = await Bus.command.execute(CommandType.CreateMonster)

    if (!result.success) {
      Debug.write(`No free dungeon tile to spawn monster at turn ${game.turns}`)
      return
    }
  }

  async function handleMovement(dx: number, dy: number) {
    const result = await Bus.command.execute(CommandType.MoveHero, {
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
