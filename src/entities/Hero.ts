import { Position } from '../types'
import { Entity } from './Entity'

export class Hero extends Entity {
  kills: number = 0

  constructor({ x, y }: Position) {
    super({ x, y, char: '@', speed: 10 })
  }

  giveEnergy() {
    this._energy += this.speed
  }

  move(
    dx: number,
    dy: number,
  ): {
    from: Position
    to: Position
  } {
    const from = { x: this.x, y: this.y }
    this.x += dx
    this.y += dy

    this._energy -= this.speed
    return {
      from,
      to: { x: this.x, y: this.y },
    }
  }
}
