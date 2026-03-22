import { BufferCompositor } from './buffer/BufferCompositor'
import { Debug } from './Debug'
import { MonsterCollection } from './entities/EntityCollection'
import { Game } from './Game'
import { Layout } from './Layout'
import { Dungeon } from './levels/Dungeon'
import { CreateHeroCommandHandler } from './messaging/commands/CreateHero'
import { CreateMonsterCommandHandler } from './messaging/commands/CreateMonster'
import { MoveHeroCommandHandler } from './messaging/commands/MoveHero'
import { MoveMonsterCommandHandler } from './messaging/commands/MoveMonster'
import { ProcessMonsterRoundCommandHandler } from './messaging/commands/ProcessMonsterRound'
import { ProcessUntilHeroReadyCommandHandler } from './messaging/commands/ProcessUntilHeroReady'
import {
  CommandBus,
  Commands,
  CommandType,
  EventBus,
  Events,
  EventType,
} from './messaging/core'
import { MoveCreatureCollisionService } from './messaging/services/MoveCreatureCollisionService'
import { Random } from './Random'
import { flushBuffer } from './screen/BufferWriter'
import { DungeonRenderer } from './screen/DungeonRenderer'
import { StatusRenderer } from './screen/StatusRenderer'
import { Terminal } from './screen/Terminal'

const random = new Random('lenn-seed')

const createHeroCommandHandler = new CreateHeroCommandHandler(
  Layout.dungeon.size,
  random.create('create-hero'),
)
const hero = createHeroCommandHandler.handle().hero
const monsters = new MonsterCollection()
const dungeon = new Dungeon(Layout.dungeon.size, hero, monsters)
const game = new Game(dungeon)
const commandBus = new CommandBus<Commands>()
const eventBus = new EventBus<Events>()

const terminal = new Terminal(game.width, game.height)
Debug.initialize({ terminal, game })

const bufferCompositor = new BufferCompositor({
  width: game.width,
  height: game.height,
})
const statusRenderer = new StatusRenderer({
  bufferCompositor,
  terminal,
  eventBus,
  size: Layout.status.size,
  position: Layout.status.position,
})
statusRenderer.attach()
const dungeonRenderer = new DungeonRenderer({
  bufferCompositor: bufferCompositor,
  terminal,
  eventBus,
  size: Layout.dungeon.size,
  position: Layout.dungeon.position,
})
dungeonRenderer.attach()

/** @deprecated */
function forceRedrawForInvalidTerminal() {
  terminal.clear()
  flushBuffer(terminal, bufferCompositor)
}

const moveCreatureCollisionService = new MoveCreatureCollisionService(
  dungeon,
  monsters,
  hero,
)
const moveHeroCommandHandler = new MoveHeroCommandHandler(
  hero,
  moveCreatureCollisionService,
  eventBus,
)
const moveMonsterCommandHandler = new MoveMonsterCommandHandler(
  hero,
  moveCreatureCollisionService,
  random.create('move-monster'),
  eventBus,
)
const processMonsterRoundCommandHandler = new ProcessMonsterRoundCommandHandler(
  monsters,
  hero,
  commandBus,
)
const processUntilHeroReadyCommandHandler =
  new ProcessUntilHeroReadyCommandHandler(hero, commandBus)
commandBus.register(CommandType.MoveHero, (payload) =>
  moveHeroCommandHandler.handle(payload),
)
commandBus.register(CommandType.MoveMonster, (payload) =>
  moveMonsterCommandHandler.handle(payload),
)
commandBus.register(CommandType.ProcessMonsterRound, () =>
  processMonsterRoundCommandHandler.handle(),
)
commandBus.register(CommandType.ProcessUntilHeroReady, () =>
  processUntilHeroReadyCommandHandler.handle(),
)

const createMonsterCommandHandler = new CreateMonsterCommandHandler(
  dungeon,
  monsters,
  random.create('create-monster'),
  eventBus,
)
commandBus.register(CommandType.CreateMonster, () =>
  createMonsterCommandHandler.handle(),
)

let gameEnabled = false

terminal.on('invalid', () => {
  gameEnabled = false
})

terminal.on('valid', () => {
  forceRedrawForInvalidTerminal()
  gameEnabled = true
})

terminal.on('input', onInput)

void startGame()

async function startGame() {
  await eventBus.publish(EventType.GameInitialized, {
    hero,
  })
  gameEnabled = true
}

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
}

async function handleCreateMonster() {
  const result = await commandBus.execute(CommandType.CreateMonster)

  if (!result.success) {
    Debug.write(`No free dungeon tile to spawn monster at turn ${hero.turns}`)
    return
  }
}

async function handleMovement(dx: number, dy: number) {
  const result = await commandBus.execute(CommandType.MoveHero, {
    dx,
    dy,
  })

  if (result.success) {
    Debug.write(
      `Hero moves to (${result.to.x},${result.to.y}) at turn ${hero.turns}.`,
    )
    const turnResult = await commandBus.execute(
      CommandType.ProcessUntilHeroReady,
    )

    for (const round of turnResult.rounds) {
      for (const action of round.actions) {
        const monster = action.monster
        const monsterResult = action.result

        if (monsterResult.success) {
          Debug.write(
            `${monster.char} moves to (${monsterResult.to.x},${monsterResult.to.y}) at turn ${hero.turns}. Speed: ${monster.speed}, Energy: ${monster.energy}`,
          )
        } else {
          Debug.write(
            `${monster.char} bumps into a ${monsterResult.reason} at turn ${hero.turns}`,
          )
        }
      }
    }
  } else {
    if (result.reason === 'wall') {
      Debug.write(`Hero bumps into a wall at turn ${hero.turns}`)
    } else if (result.reason === 'monster') {
      Debug.write(
        `Hero bumps into a ${result.monster.char} at turn ${hero.turns}`,
      )
    }
  }
}
