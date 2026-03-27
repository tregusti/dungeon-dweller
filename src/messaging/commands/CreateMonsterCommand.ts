import { Monster } from '../../entities/Monster'
import { MonsterCollection } from '../../entities/MonsterCollection'
import { Dungeon } from '../../levels/Dungeon'
import { RandomGenerator } from '../../Random'
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

    const idx = this.random.int(freeCoords.length - 1)
    const spawnAt = freeCoords[idx]
    const monster = new Monster({
      ...spawnAt,
      levelId,
      speed: this.random.int(3, 15),
    })
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
