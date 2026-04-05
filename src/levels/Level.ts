import { Tile } from '../entities/Tile.js'
import { assert, Coords } from '../types.js'

export class Level {
  static fromLayout(id: string, layoutStr: string): Level {
    // Parse input string
    const raw = layoutStr
      .replace(/^\n+|\n+$/gm, '')
      .split('\n')
      .map((line) => line.split(''))

    // Fill layout with tiles
    const layout = raw.map((row, y) =>
      row.map((char, x) => {
        const type = Tile.typeForChar(char)
        const tile = Tile.create({ x, y, levelId: id }, type)
        return tile
      }),
    )

    // Return new level instance
    return new Level(id, layout)
  }

  constructor(
    public readonly id: string,
    private readonly layout: Tile[][],
  ) {}

  get width(): number {
    return this.layout[0]?.length ?? 0
  }

  get height(): number {
    return this.layout.length
  }

  at(x: number, y: number): Tile {
    assert(
      this.isInside(x, y),
      `Coordinates (${x}, ${y}) are out of bounds for level ${this.id} with dimensions ${this.width}x${this.height}`,
    )
    return this.layout[y][x]
  }

  isInside(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height
  }

  *coords(): Generator<Coords> {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        yield { x, y }
      }
    }
  }
}
