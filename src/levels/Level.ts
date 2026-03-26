import { Position } from '../types'

export class Level {
  constructor(
    public readonly id: string,
    private readonly layout: string[][],
  ) {}

  get width(): number {
    return this.layout[0]?.length ?? 0
  }

  get height(): number {
    return this.layout.length
  }

  at(x: number, y: number): string {
    return this.layout[y][x]
  }

  isInside(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height
  }

  *positions(): Generator<Position> {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        yield { x, y }
      }
    }
  }
}
