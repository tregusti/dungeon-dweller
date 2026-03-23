import { Hero } from '../entities/Hero'
import { MonsterCollection } from '../entities/MonsterCollection'
import { Dungeon } from '../levels/Dungeon'
import { CreateMonsterCommandHandler } from '../messaging/commands/CreateMonsterCommand'
import { MeleeAttackCreatureCommandHandler } from '../messaging/commands/MeleeAttackCreatureCommand'
import { MoveHeroCommandHandler } from '../messaging/commands/MoveHeroCommand'
import { MoveMonsterCommandHandler } from '../messaging/commands/MoveMonsterCommand'
import { ProcessMonsterRoundCommandHandler } from '../messaging/commands/ProcessMonsterRoundCommand'
import { ProcessUntilHeroReadyCommandHandler } from '../messaging/commands/ProcessUntilHeroReadyCommand'
import {
  CommandBus,
  Commands,
  CommandType,
  EventBus,
  Events,
} from '../messaging/core'
import { MoveCreatureCollisionService } from '../messaging/services/MoveCreatureCollisionService'
import { Random } from '../Random'

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

  commandBus.register(CommandType.MoveHero, (payload) =>
    moveHeroCommandHandler.handle(payload),
  )
  commandBus.register(CommandType.MoveMonster, (payload) =>
    moveMonsterCommandHandler.handle(payload),
  )
  commandBus.register(CommandType.MeleeAttackCreature, (payload) =>
    meleeAttackCreatureCommandHandler.handle(payload),
  )
  commandBus.register(CommandType.ProcessMonsterRound, () =>
    processMonsterRoundCommandHandler.handle(),
  )
  commandBus.register(CommandType.ProcessUntilHeroReady, () =>
    processUntilHeroReadyCommandHandler.handle(),
  )
  commandBus.register(CommandType.CreateMonster, () =>
    createMonsterCommandHandler.handle(),
  )
}
