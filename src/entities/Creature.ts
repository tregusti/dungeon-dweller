import { Spot } from '../types'

export abstract class Creature {
  x: number
  y: number
  level: string
  char: string
  speed: number
  protected _energy: number = 0

  get energy() {
    return this._energy
  }

  constructor({
    x,
    y,
    level = '1',
    char,
    speed,
  }: {
    char: string
    speed: number
  } & Spot) {
    this.x = x
    this.y = y
    this.level = level
    this.char = char
    this.speed = speed
  }
}
