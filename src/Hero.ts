import { Entity } from './Entity'

export class Hero extends Entity {
  turns: number

  constructor(x: number, y: number) {
    super(x, y, '@', 20)
    this.turns = 0
  }

  move(dx: number, dy: number, cols: number, gameRows: number): boolean {
    const nx = Math.max(0, Math.min(cols - 1, this.x + dx))
    const ny = Math.max(0, Math.min(gameRows - 1, this.y + dy))

    // return true if position actually changed
    if (nx !== this.x || ny !== this.y) {
      this.x = nx
      this.y = ny
      this.turns++
      return true
    }
    return false
  }
}
