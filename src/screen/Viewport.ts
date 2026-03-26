import { Level } from '../levels/Level'
import { Position, Size } from '../types'

type ViewportLevel = Pick<Level, 'at' | 'width' | 'height'>

export class Viewport {
  private x: number = 0
  private y: number = 0

  constructor(
    readonly width: number,
    readonly height: number,
    private readonly scrollMargin: Position,
  ) {}

  get origin(): Position {
    return { x: this.x, y: this.y }
  }

  update(position: Position, bounds: Size): Position {
    this.x = this.getNextOrigin(
      position.x,
      this.x,
      this.width,
      bounds.width,
      this.scrollMargin.x,
    )
    this.y = this.getNextOrigin(
      position.y,
      this.y,
      this.height,
      bounds.height,
      this.scrollMargin.y,
    )

    return this.origin
  }

  contains(position: Position): boolean {
    return (
      position.x >= this.x &&
      position.x < this.x + this.width &&
      position.y >= this.y &&
      position.y < this.y + this.height
    )
  }

  toScreen(position: Position): Position | null {
    if (!this.contains(position)) {
      return null
    }

    return {
      x: position.x - this.x,
      y: position.y - this.y,
    }
  }

  render(level: ViewportLevel): string[][] {
    const output: string[][] = []
    for (let j = 0; j < this.height; j++) {
      const row: string[] = []
      for (let i = 0; i < this.width; i++) {
        const worldX = this.x + i
        const worldY = this.y + j
        const isWithinLevel = worldX < level.width && worldY < level.height

        row.push(isWithinLevel ? level.at(worldX, worldY) : ' ')
      }
      output.push(row)
    }
    return output
  }

  private getNextOrigin(
    focus: number,
    origin: number,
    viewportSize: number,
    worldSize: number,
    margin: number,
  ): number {
    const maxOrigin = Math.max(0, worldSize - viewportSize)
    const upperThreshold = viewportSize - margin - 1
    const focusOnScreen = focus - origin

    if (focusOnScreen < margin) {
      return this.clamp(focus - margin, 0, maxOrigin)
    }

    if (focusOnScreen > upperThreshold) {
      return this.clamp(focus - upperThreshold, 0, maxOrigin)
    }

    return this.clamp(origin, 0, maxOrigin)
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
  }
}
