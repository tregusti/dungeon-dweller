import { MonsterCollection } from '../../../entities/EntityCollection'
import { Hero } from '../../../entities/Hero'
import { Monster } from '../../../entities/Monster'
import { Dungeon } from '../../../levels/Dungeon'
import { Random } from '../../../Random'
import { Bus } from '../../core'
import { EventType } from '../../core/Events'
import type { CreateMonsterCommandResult } from './CreateMonsterCommand'

export class CreateMonsterCommandHandler {
  constructor(
    private readonly dungeon: Dungeon,
    private readonly monsters: MonsterCollection,
    private readonly random: Random,
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
    const monster = new Monster(spawnAt)
    this.monsters.add(monster)

    Bus.event.publish(EventType.MonsterCreated, {
      monster,
      at: spawnAt,
    })

    return {
      success: true,
      monster,
    }
  }
}
