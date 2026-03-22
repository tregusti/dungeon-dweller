import { Dungeon } from './levels/Dungeon'
import { Size } from './types'

export class Game implements Readonly<Size> {
  readonly width: number
  readonly height: number

  constructor(dungeon: Dungeon) {
    this.width = Math.max(dungeon.width, 0)
    this.height = dungeon.height + 3
  }
}
