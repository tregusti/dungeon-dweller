import { ActionResult, Entity } from './Entity'
import { Position } from '../types'

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
    gameWidth: number,
    gameHeight: number,
  ): ActionResult {
    const from = { x: this.x, y: this.y }
    const nx = Math.max(0, Math.min(gameWidth - 1, this.x + dx))
    const ny = Math.max(0, Math.min(gameHeight - 1, this.y + dy))

    if (nx !== this.x || ny !== this.y) {
      this.x = nx
      this.y = ny
      this._energy -= this.speed
      return { from, to: { x: this.x, y: this.y }, type: 'move' }
    }
    return { type: 'noop' }
  }
}
