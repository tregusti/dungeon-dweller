import { Hero } from '../entities/Hero.js'
import { MonsterCollection } from '../entities/MonsterCollection.js'
import { Dungeon } from '../levels/Dungeon.js'
import { CreateMonsterCommandHandler } from '../messaging/commands/CreateMonsterCommand.js'
import { MeleeAttackCreatureCommandHandler } from '../messaging/commands/MeleeAttackCreatureCommand.js'
import { MoveHeroCommandHandler } from '../messaging/commands/MoveHeroCommand.js'
import { MoveMonsterCommandHandler } from '../messaging/commands/MoveMonsterCommand.js'
import { ProcessMonsterRoundCommandHandler } from '../messaging/commands/ProcessMonsterRoundCommand.js'
import { ProcessUntilHeroReadyCommandHandler } from '../messaging/commands/ProcessUntilHeroReadyCommand.js'
import { SwitchLevelCommandHandler } from '../messaging/commands/SwitchLevelCommand.js'
import { CommandBus, Commands, EventBus, Events } from '../messaging/core/main.js'
import { MoveCreatureCollisionService } from '../messaging/services/MoveCreatureCollisionService.js'
import { Random } from '../Random.js'

type RegisterCommandHandlersArgs = {
  commandBus: CommandBus<Commands>
  eventBus: EventBus<Events>
  dungeon: Dungeon
  monsters: MonsterCollection
  hero: Hero
  random: Random
}

export function registerCommandHandlers({
  commandBus,
  eventBus,
  dungeon,
  monsters,
  hero,
  random,
}: RegisterCommandHandlersArgs) {
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
  const processMonsterRoundCommandHandler =
    new ProcessMonsterRoundCommandHandler(monsters, hero, commandBus)
  const meleeAttackCreatureCommandHandler =
    new MeleeAttackCreatureCommandHandler(monsters, eventBus)
  const processUntilHeroReadyCommandHandler =
    new ProcessUntilHeroReadyCommandHandler(hero, commandBus)
  const createMonsterCommandHandler = new CreateMonsterCommandHandler(
    dungeon,
    monsters,
    random.create('create-monster'),
    eventBus,
  )
  const switchLevelCommandHandler = new SwitchLevelCommandHandler(
    hero,
    eventBus,
  )

  commandBus.register('MoveHero', (payload) =>
    moveHeroCommandHandler.handle(payload),
  )
  commandBus.register('MoveMonster', (payload) =>
    moveMonsterCommandHandler.handle(payload),
  )
  commandBus.register('MeleeAttackCreature', (payload) =>
    meleeAttackCreatureCommandHandler.handle(payload),
  )
  commandBus.register('ProcessMonsterRound', () =>
    processMonsterRoundCommandHandler.handle(),
  )
  commandBus.register('ProcessUntilHeroReady', () =>
    processUntilHeroReadyCommandHandler.handle(),
  )
  commandBus.register('CreateMonster', (payload) =>
    createMonsterCommandHandler.handle(payload),
  )
  commandBus.register('SwitchLevel', (payload) =>
    switchLevelCommandHandler.handle(payload),
  )
}
