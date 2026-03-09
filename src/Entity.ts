import { Position } from './types'

export class Entity {
  x: number
  y: number
  char: string
  /**
   * IDEA: Maybe use the inverse of speed (i.e. delay between actions) instead,
   * so that higher is slower and lower is faster? then sort all entities by
   * that value to determine action order, and subtract from it each tick until
   * it reaches 0, then reset to speed and act. This would allow for more
   * interesting interactions between entities of different speeds, e.g. a very
   * fast entity could act multiple times before a slower one gets to act once.
   */
  speed: number
  ticksUntilAct: number

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
    this.ticksUntilAct = this.speed
  }

  tick(): boolean {
    this.ticksUntilAct--

    if (this.ticksUntilAct <= 0) {
      this.ticksUntilAct = this.speed
      return true // ready to act
    }

    return false
  }
}
