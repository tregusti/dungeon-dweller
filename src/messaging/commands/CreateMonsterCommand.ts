import { CreatureTypes } from '../../entities/CreatureDefinitions'
import { Monster } from '../../entities/Monster'
import { MonsterCollection } from '../../entities/MonsterCollection'
import { Dungeon } from '../../levels/Dungeon'
import { RandomGenerator } from '../../Random'
import { Cell } from '../../types'
import { EventBus, Events } from '../core'
import type { CommandDef } from '../core/Commands'

declare module '../core/Commands' {
  interface Commands {
    CreateMonster: CommandDef<
      CreateMonsterCommandPayload,
      CreateMonsterCommandResult
    >
  }
}

export type CreateMonsterCommandPayload = {
  levelId: string
}

export type CreateMonsterCommandResult =
  | {
      success: false
      reason: 'dungeon-full'
    }
  | {
      success: true
      monster: Monster
    }

export class CreateMonsterCommandHandler {
  constructor(
    private readonly dungeon: Dungeon,
    private readonly monsters: MonsterCollection,
    private readonly random: RandomGenerator,
    private readonly events: EventBus<Events>,
  ) {}

  handle({ levelId }: CreateMonsterCommandPayload): CreateMonsterCommandResult {
    const freeCoords = this.dungeon.getFreeCoords(levelId)
    if (freeCoords.length === 0) {
      return {
        success: false,
        reason: 'dungeon-full',
      }
    }

    const coords = freeCoords[this.random.int(freeCoords.length - 1)]
    const spawnAt: Cell = { ...coords, levelId }
    const type = this.random.choice(CreatureTypes)
    const monster = Monster.create(type, spawnAt)
    this.monsters.add(monster)

    this.events.publish('MonsterCreated', {
      monster,
      at: spawnAt,
    })

    return {
      success: true,
      monster,
    }
  }
}
