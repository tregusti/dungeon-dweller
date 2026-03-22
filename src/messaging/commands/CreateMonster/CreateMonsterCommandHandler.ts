import { MonsterCollection } from '../../../entities/EntityCollection'
import { Monster } from '../../../entities/Monster'
import { Dungeon } from '../../../levels/Dungeon'
import { RandomGenerator } from '../../../Random'
import { EventBus, Events, EventType } from '../../core'
import type { CreateMonsterCommandResult } from './CreateMonsterCommand'

export class CreateMonsterCommandHandler {
  constructor(
    private readonly dungeon: Dungeon,
    private readonly monsters: MonsterCollection,
    private readonly random: RandomGenerator,
    private readonly events: EventBus<Events>,
  ) {}

  handle(): CreateMonsterCommandResult {
    const freePositions = this.dungeon.getFreePositions()
    if (freePositions.length === 0) {
      return {
        success: false,
        reason: 'dungeon-full',
      }
    }

    const idx = this.random.int(freePositions.length - 1)
    const spawnAt = freePositions[idx]
    const monster = new Monster({
      ...spawnAt,
      speed: this.random.int(3, 15),
    })
    this.monsters.add(monster)

    this.events.publish(EventType.MonsterCreated, {
      monster,
      at: spawnAt,
    })

    return {
      success: true,
      monster,
    }
  }
}
