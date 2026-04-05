import { Tile } from '../entities/Tile.js'
import { Level } from '../levels/Level.js'
import { Size } from '../types.js'

export class LevelBuilder {
  private size = { width: 10, height: 10 }
  private layout?: string
  private tiles = new Map<string, string>()
  private id: string = '1'

  static create() {
    return new LevelBuilder()
  }
  withTile(x: number, y: number, type: string): LevelBuilder {
    this.tiles.set(`${x},${y}`, type)
    return this
  }
  withId(id: string): LevelBuilder {
    this.id = id
    return this
  }
  withSize(size: Size): LevelBuilder
  withSize(width: number, height: number): LevelBuilder
  withSize(...args: [Size] | [number, number]): LevelBuilder {
    if (args.length === 1) {
      this.size = args[0]
    } else {
      const [width, height] = args
      this.size = { width, height }
    }
    return this
  }
  withLayout(layout: string) {
    this.layout = layout
    return this
  }
  build() {
    // if nothing provided create a layout based on default size
    const sizeLayout = Array(this.size.height)
      .fill(null)
      .map(() => Array(this.size.width).fill('·').join(''))
      .join('\n')
    let level = Level.fromLayout(this.id, sizeLayout)

    // if layout provided, use it instead
    if (this.layout) {
      level = Level.fromLayout(this.id, this.layout)
    }

    // if tiles provided, clone the layout and apply them on top of it
    if (this.tiles.size > 0) {
      const tiles: Tile[][] = Array(level.height)
        .fill(null)
        .map(() => Array(level.width).fill(null))
      for (const coord of level.coords()) {
        const key = `${coord.x},${coord.y}`
        tiles[coord.y][coord.x] = this.tiles.has(key)
          ? Tile.create(
              { x: coord.x, y: coord.y, levelId: this.id },
              this.tiles.get(key)!,
            )
          : level.at(coord.x, coord.y)
      }
      level = new Level(this.id, tiles)
    }

    return level
  }
}
