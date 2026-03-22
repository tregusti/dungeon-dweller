import { Dungeon } from './levels/Dungeon'
import { Status } from './Status'
import { Size } from './types'

export class Game implements Readonly<Size> {
  private _turns: number = 0

  readonly width: number
  readonly height: number

  constructor(dungeon: Dungeon, status: Status) {
    this.width = Math.max(dungeon.width, status.width)
    this.height = dungeon.height + status.height
  }

  get turns() {
    return this._turns
  }
  advanceTurn() {
    this._turns++
  }
}
