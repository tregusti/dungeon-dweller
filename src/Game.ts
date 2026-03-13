import { EntityCollection } from './entities/EntityCollection'
import { Hero } from './entities/Hero'
import { DeepReadonly, Size } from './types'

type GameOptions = DeepReadonly<{
  dungeon: Size
  status: Size
}>

export class Game implements Readonly<Size> {
  readonly dungeon: Readonly<Size>
  readonly status: Readonly<Size>
  readonly width: number
  readonly height: number
  /** Convenience property. Same as Game#entities.hero */
  readonly hero: Hero

  readonly entities: EntityCollection

  constructor({ dungeon, status }: GameOptions) {
    this.width = Math.max(dungeon.width, status.width)
    this.height = dungeon.height + status.height
    this.dungeon = dungeon
    this.status = status
    this.hero = new Hero({
      x: Math.floor(dungeon.width / 2),
      y: Math.floor(dungeon.height / 2),
    })
    this.entities = new EntityCollection(this.hero)
  }

  private _tick = 0
  get tick() {
    return this._tick
  }
  advance() {
    this._tick++
  }
}
