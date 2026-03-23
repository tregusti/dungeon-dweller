import { Position } from '../types'
import { Creature } from './Creature'

export class Hero extends Creature {
  kills: number = 0
  _turns: number = 0

  get turns() {
    return this._turns
  }

  constructor({ x, y }: Position) {
    super({ x, y, char: '@', speed: 10 })
    // For hero, energy starts at full so they can act immediately
    this._energy = this.speed
  }

  giveEnergy() {
    this._energy += this.speed
  }

  move(dx: number, dy: number): { from: Position; to: Position } {
    const from = { x: this.x, y: this.y }
    this.x += dx
    this.y += dy

    this._energy -= this.speed
    this._turns++

    return {
      from,
      to: { x: this.x, y: this.y },
    }
  }
}
