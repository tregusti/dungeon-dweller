import { MonsterCollection } from '../entities/EntityCollection'
import { Hero } from '../entities/Hero'
import { Monster } from '../entities/Monster'
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
}
