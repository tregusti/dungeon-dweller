import { MonsterCollection } from '../../../entities/EntityCollection'
import { Monster } from '../../../entities/Monster'
import { Position, Size } from '../../../types'

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

export class MoveHeroCollisionService {
  constructor(
    private readonly dungeon: Readonly<Size>,
    private readonly monsters: MonsterCollection,
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
    // check for outer boundary collision
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

    // check for monster at attempted position
    const monster = this.monsters.all.find(
      (m) => m.x === attemptedTo.x && m.y === attemptedTo.y,
    )
    if (monster) {
      return {
        success: false,
        reason: 'monster',
        monster,
      }
    }

    // otherwise, it's a successful move
    return {
      success: true,
    }
  }
}
