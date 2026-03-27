import { Hero } from '../../entities/Hero'
import { Monster } from '../../entities/Monster'
import { MonsterCollection } from '../../entities/MonsterCollection'
import { Dungeon } from '../../levels/Dungeon'
import { Coords } from '../../types'

type LevelLookup = Pick<Dungeon, 'getLevel'>

type MoveEvaluation =
  | { success: true }
  | {
      success: false
      reason: 'monster'
      monster: Monster
    }
  | {
      success: false
      reason: 'wall'
    }
  | {
      success: false
      reason: 'hero'
      hero: Hero
    }

export class MoveCreatureCollisionService {
  constructor(
    private readonly levelLookup: LevelLookup,
    private readonly monsters: MonsterCollection,
    private readonly hero: Hero,
  ) {}

  evaluate({
    from,
    dx,
    dy,
    levelId,
  }: {
    from: Coords
    dx: number
    dy: number
    levelId: string
  }): MoveEvaluation {
    const attemptedTo = { x: from.x + dx, y: from.y + dy }
    const level = this.levelLookup.getLevel(levelId)
    if (!level.isInside(attemptedTo.x, attemptedTo.y)) {
      return {
        success: false,
        reason: 'wall',
      }
    }

    if (
      this.hero.levelId === levelId &&
      this.hero.x === attemptedTo.x &&
      this.hero.y === attemptedTo.y
    ) {
      return {
        success: false,
        reason: 'hero',
        hero: this.hero,
      }
    }

    const monster = this.monsters
      .list({ levelId })
      .find((m) => m.x === attemptedTo.x && m.y === attemptedTo.y)
    if (monster) {
      return {
        success: false,
        reason: 'monster',
        monster,
      }
    }

    return {
      success: true,
    }
  }
}
