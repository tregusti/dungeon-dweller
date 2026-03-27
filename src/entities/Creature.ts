import { Cell } from '../types'

export abstract class Creature {
  x: number
  y: number
  levelId: string
  char: string
  speed: number
  protected _energy: number = 0

  get energy() {
    return this._energy
  }

  constructor({
    x,
    y,
    levelId = '1',
    char,
    speed,
  }: {
    char: string
    speed: number
  } & Cell) {
    this.x = x
    this.y = y
    this.levelId = levelId
    this.char = char
    this.speed = speed
  }
}
