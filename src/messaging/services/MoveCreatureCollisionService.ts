import { Hero } from '../../entities/Hero'
import { Monster } from '../../entities/Monster'
import { MonsterCollection } from '../../entities/MonsterCollection'
import { Dungeon } from '../../levels/Dungeon'
import { Position } from '../../types'

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
    from: Position
    dx: number
    dy: number
    levelId: string
  }): MoveEvaluation {
    const attemptedTo = { x: from.x + dx, y: from.y + dy }
    const level = this.levelLookup.getLevel(levelId)
    const outside =
      attemptedTo.x < 0 ||
      attemptedTo.y < 0 ||
      attemptedTo.x >= level.width ||
      attemptedTo.y >= level.height
    if (outside) {
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
