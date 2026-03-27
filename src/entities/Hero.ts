import { Cell, Coords } from '../types'
import { Creature } from './Creature'

export class Hero extends Creature {
  kills: number = 0
  _turns: number = 0

  get turns() {
    return this._turns
  }

  constructor({ x, y, levelId }: Cell) {
    super({ x, y, char: '@', speed: 10, levelId })
    // For hero, energy starts at full so they can act immediately
    this._energy = this.speed
  }

  giveEnergy() {
    this._energy += this.speed
  }

  move(dx: number, dy: number): { from: Coords; to: Coords } {
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
