import { Hero } from '../../entities/Hero'
import { Monster } from '../../entities/Monster'
import { MonsterCollection } from '../../entities/MonsterCollection'
import { Position, Size } from '../../types'

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
    private readonly dungeon: Readonly<Size>,
    private readonly monsters: MonsterCollection,
    private readonly hero: Hero,
  ) {}

  evaluate({
    from,
    dx,
    dy,
  }: {
    from: Position
    dx: number
    dy: number
  }): MoveEvaluation {
    const attemptedTo = { x: from.x + dx, y: from.y + dy }
    const outside =
      attemptedTo.x < 0 ||
      attemptedTo.y < 0 ||
      attemptedTo.x >= this.dungeon.width ||
      attemptedTo.y >= this.dungeon.height
    if (outside) {
      return {
        success: false,
        reason: 'wall',
      }
    }

    if (this.hero.x === attemptedTo.x && this.hero.y === attemptedTo.y) {
      return {
        success: false,
        reason: 'hero',
        hero: this.hero,
      }
    }

    const monster = this.monsters
      .list()
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
