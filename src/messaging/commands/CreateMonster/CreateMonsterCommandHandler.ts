import { MonsterCollection } from '../../../entities/EntityCollection'
import { Hero } from '../../../entities/Hero'
import { Monster } from '../../../entities/Monster'
import { Dungeon } from '../../../levels/Dungeon'
import { Random } from '../../../Random'
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

    return {
      success: true,
      monster,
    }
  }
}
