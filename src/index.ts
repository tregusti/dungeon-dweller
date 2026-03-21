import { Buffer } from './buffer/Buffer'
import { BufferCompositor } from './buffer/BufferCompositor'
import { Debug } from './Debug'
import { MonsterCollection } from './entities/EntityCollection'
import { Game } from './Game'
import { Dungeon } from './levels/Dungeon'
import { CreateHeroCommandHandler } from './messaging/commands/CreateHero'
import { CreateMonsterCommandHandler } from './messaging/commands/CreateMonster'
import { MoveHeroCommandHandler } from './messaging/commands/MoveHero'
import { MoveMonsterCommandHandler } from './messaging/commands/MoveMonster'
import { Bus } from './messaging/core'
import { CommandType } from './messaging/core/Commands'
import { EventType } from './messaging/core/Events'
import { MoveCreatureCollisionService } from './messaging/services/MoveCreatureCollisionService'
import { Random } from './Random'
import { flushBuffer } from './screen/BufferWriter'
import { Renderer } from './screen/Renderer'
import { Terminal } from './screen/Terminal'
import { Status } from './Status'

const random = new Random('lenn-seed')

const dungeonSize = { width: 20, height: 10 }

const status = new Status({ width: dungeonSize.width, height: 3 })
const createHeroCommandHandler = new CreateHeroCommandHandler(
  dungeonSize,
  random.create('create-hero'),
)
const hero = createHeroCommandHandler.handle().hero
const monsters = new MonsterCollection()
const dungeon = new Dungeon(dungeonSize, hero, monsters)
const game = new Game(dungeon, status, hero, monsters)

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

const moveCreatureCollisionService = new MoveCreatureCollisionService(
  game.dungeon,
  game.monsters,
  game.hero,
)
const moveHeroCommandHandler = new MoveHeroCommandHandler(
  game.hero,
  moveCreatureCollisionService,
  Bus.event,
)
const moveMonsterCommandHandler = new MoveMonsterCommandHandler(
  hero,
  moveCreatureCollisionService,
  random.create('move-monster'),
  Bus.event,
)
Bus.command.register(CommandType.MoveHero, (payload) =>
  moveHeroCommandHandler.handle(payload),
)
Bus.command.register(CommandType.MoveMonster, (payload) =>
  moveMonsterCommandHandler.handle(payload),
)

const createMonsterCommandHandler = new CreateMonsterCommandHandler(
  game.dungeon,
  game.monsters,
  random.create('create-monster'),
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
    Debug.write(
      `Hero moves to (${result.to.x},${result.to.y}) at turn ${game.turns}.`,
    )
    do {
      await game.processMonsterTurn(async (monster) => {
        const result = await Bus.command.execute(CommandType.MoveMonster, {
          monster,
        })

        if (result.success) {
          Debug.write(
            `${monster.char} moves to (${result.to.x},${result.to.y}) at turn ${game.turns}. Speed: ${monster.speed}, Energy: ${monster.energy}`,
          )
        } else {
          Debug.write(
            `${monster.char} bumps into a ${result.reason} at turn ${game.turns}`,
          )
        }
      })
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
