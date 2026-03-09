import { DeepReadonly } from 'ts-essentials'

type Size = {
  width: number
  height: number
}
type GameOptions = DeepReadonly<{
  dungeon: Size
  status: Size
}>

export class Game implements Readonly<Size> {
  readonly dungeon: Readonly<Size>
  readonly status: Readonly<Size>
  readonly width: number
  readonly height: number

  constructor({ dungeon, status }: GameOptions) {
    this.width = Math.max(dungeon.width, status.width)
    this.height = dungeon.height + status.height
    this.dungeon = dungeon
    this.status = status
  }

  private _tick = 0
  get tick() {
    return this._tick
  }
  advance() {
    this._tick++
  }
}
