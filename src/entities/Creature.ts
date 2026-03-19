import { Position } from '../types'

export type ActionType = 'move' | 'noop'
export type ActionResult = Readonly<
  { type: ActionType } & (
    | { type: 'noop' }
    | {
        type: 'move'
        from: Position
        to: Position
      }
  )
>

export abstract class Creature {
  x: number
  y: number
  char: string
  speed: number
  protected _energy: number = 0

  get energy() {
    return this._energy
  }

  constructor({
    x,
    y,
    char,
    speed,
  }: {
    char: string
    speed: number
  } & Position) {
    this.x = x
    this.y = y
    this.char = char
    this.speed = speed
  }
}
