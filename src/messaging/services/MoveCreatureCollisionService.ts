import { Hero } from '../../entities/Hero.js'
import { MonsterCollection } from '../../entities/MonsterCollection.js'
import { Trait } from '../../entities/Trait.js'
import { Dungeon, TypeContentType } from '../../levels/Dungeon.js'
import { Coords } from '../../types.js'

type LevelLookup = Pick<Dungeon, 'getLevel'>

type MoveEvaluation =
  | { success: true }
  | {
      success: false
      reason: 'outside'
    }
  | ({
      success: false
      reason: 'blocked'
    } & TypeContentType)

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
        reason: 'outside',
      }
    }

    if (
      this.hero.levelId === levelId &&
      this.hero.x === attemptedTo.x &&
      this.hero.y === attemptedTo.y
    ) {
      return {
        success: false,
        reason: 'blocked',
        type: 'hero',
        content: this.hero,
      }
    }

    const monster = this.monsters
      .list({ levelId })
      .find((m) => m.x === attemptedTo.x && m.y === attemptedTo.y)
    if (monster) {
      return {
        success: false,
        reason: 'blocked',
        type: 'monster',
        content: monster,
      }
    }

    const tile = level.at(attemptedTo.x, attemptedTo.y)
    if (tile.traits & Trait.Blocking) {
      return {
        success: false,
        reason: 'blocked',
        type: 'tile',
        content: tile,
      }
    }

    return {
      success: true,
    }
  }
}
