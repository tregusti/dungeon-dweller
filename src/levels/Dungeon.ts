import { Hero } from '../entities/Hero'
import { Monster } from '../entities/Monster'
import { MonsterCollection } from '../entities/MonsterCollection'
import { Position, Size } from '../types'

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

  constructor(
    size: Size,
    private hero: Hero,
    private monsters: MonsterCollection,
  ) {
    this.width = size.width
    this.height = size.height
  }

  at(x: number, y: number): SpotContent[] {
    if (this.hero.x === x && this.hero.y === y) {
      return [{ type: 'hero', hero: this.hero, x, y }]
    }

    const monster = this.monsters.all.find((m) => m.x === x && m.y === y)
    if (monster) {
      return [{ type: 'monster', monster, x, y }]
    }

    return []
  }
  isOccupied(x: number, y: number): boolean {
    return this.at(x, y).length > 0
  }
  isFree(x: number, y: number): boolean {
    return !this.isOccupied(x, y)
  }
  getFreePositions(): Position[] {
    const freePositions: Position[] = []
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.isFree(x, y)) {
          freePositions.push({ x, y })
        }
      }
    }
    return freePositions
  }
}
