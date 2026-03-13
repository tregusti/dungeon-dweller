import { ActionResult, Entity } from './Entity'
import { Position } from '../types'

export class Hero extends Entity {
  turns: number = 0
  kills: number = 0

  constructor({ x, y }: Position) {
    super({ x, y, char: '@', speed: 20 })
  }

  move(dx: number, dy: number, cols: number, gameRows: number): ActionResult {
    const from = { x: this.x, y: this.y }
    const nx = Math.max(0, Math.min(cols - 1, this.x + dx))
    const ny = Math.max(0, Math.min(gameRows - 1, this.y + dy))

    // return true if position actually changed
    if (nx !== this.x || ny !== this.y) {
      this.x = nx
      this.y = ny
      this.turns++
      return { from, to: { x: this.x, y: this.y }, type: 'move' }
    }
    return { from, to: from, type: 'noop' }
  }
}
