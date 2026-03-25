import { Level } from '../levels/Level'

export class Viewport {
  constructor(
    readonly level: Level,
    readonly width: number,
    readonly height: number,
  ) {}

  render(x: number, y: number): string[][] {
    const halfWidth = Math.floor(this.width / 2)
    const halfHeight = Math.floor(this.height / 2)
    const viewportX = Math.max(0, x - halfWidth)
    const viewportY = Math.max(0, y - halfHeight)

    const output: string[][] = []
    for (let j = 0; j < this.height; j++) {
      const row: string[] = []
      for (let i = 0; i < this.width; i++) {
        row.push(this.level.at(viewportX + i, viewportY + j))
      }
      output.push(row)
    }
    return output
  }
}
