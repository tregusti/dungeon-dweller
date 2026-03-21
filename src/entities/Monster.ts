import { Position } from '../types'
import { Creature } from './Creature'

export class Monster extends Creature {
  constructor({ x, y, speed }: Position & { speed: number }) {
    // pick random character
    const choices = ['x', 'm', 'M', '&', '£']
    const char = choices[Math.floor(Math.random() * choices.length)]

    super({ x, y, char, speed })
  }
  giveEnergy() {
    this._energy += this.speed
  }
  move(dx: number, dy: number): { from: Position; to: Position } {
    const from = { x: this.x, y: this.y }
    this.x += dx
    this.y += dy

    this._energy -= 10

    return {
      from,
      to: { x: this.x, y: this.y },
    }
  }
}
