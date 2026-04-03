import { colorize } from '../Color.js'
import { Tile, TileDefinitions } from '../entities/Tile.js'
import { assert, Coords } from '../types.js'

export class Level {
  static parseLayout(layoutStr: string): string[][] {
    return layoutStr
      .replace(/^\n+|\n+$/gm, '')
      .split('\n')
      .map((line) => line.split(''))
  }
  static fromLayout(id: string, layoutStr: string): Level {
    const layout = this.parseLayout(layoutStr)
    layout.forEach((row, y) =>
      row.forEach((char, x) => {
        const type = Tile.typeForChar(char)
        const def = TileDefinitions.find((def) => def.type === type)
        assert(def, `Unknown tile type: ${type}`)
        layout[y][x] = colorize(char, def.color)
      }),
    )
    return new Level(id, layout)
  }

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

  *coords(): Generator<Coords> {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        yield { x, y }
      }
    }
  }
}
