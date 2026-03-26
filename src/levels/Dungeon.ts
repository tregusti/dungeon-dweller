import { Hero } from '../entities/Hero'
import { Monster } from '../entities/Monster'
import { MonsterCollection } from '../entities/MonsterCollection'
import { DeepReadonly, Position, Size } from '../types'
import { Level } from './Level'

export type SpotContent = Readonly<
  Position &
    (
      | {
          type: 'hero'
          hero: Hero
        }
      | {
          type: 'monster'
          monster: Monster
        }
    )
>

export class Dungeon {
  readonly width: number
  readonly height: number
  readonly levels: DeepReadonly<Level>[] = []

  constructor(
    size: Size,
    private hero: Hero,
    private monsters: MonsterCollection,
    levels: DeepReadonly<Level>[] = [],
  ) {
    this.width = size.width
    this.height = size.height
    this.levels = levels
  }

  at(x: number, y: number, levelId: string = this.hero.levelId): SpotContent[] {
    if (
      this.hero.levelId === levelId &&
      this.hero.x === x &&
      this.hero.y === y
    ) {
      return [{ type: 'hero', hero: this.hero, x, y }]
    }

    const monster = this.monsters
      .list({ levelId })
      .find((m) => m.x === x && m.y === y)
    if (monster) {
      return [{ type: 'monster', monster, x, y }]
    }

    return []
  }

  isOccupied(
    x: number,
    y: number,
    levelId: string = this.hero.levelId,
  ): boolean {
    return this.at(x, y, levelId).length > 0
  }

  isFree(x: number, y: number, levelId: string = this.hero.levelId): boolean {
    return !this.isOccupied(x, y, levelId)
  }

  getLevel(id: string): DeepReadonly<Level> {
    const level = this.levels.find((l) => l.id === id)
    if (!level) throw new Error(`Level '${id}' not found`)
    return level
  }

  get currentLevel(): DeepReadonly<Level> {
    return this.getLevel(this.hero.levelId)
  }

  getFreePositions(levelId: string = this.hero.levelId): Position[] {
    const level = this.getLevel(levelId)
    const freePositions: Position[] = []
    for (const position of level.positions()) {
      if (this.isFree(position.x, position.y, levelId)) {
        freePositions.push(position)
      }
    }
    return freePositions
  }
}
