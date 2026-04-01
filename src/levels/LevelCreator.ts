import { colorize } from '../Color.js'
import { Tile, TileDefinitions } from '../entities/Tile.js'
import { Random } from '../Random.js'
import { assert, Size } from '../types.js'
import { Level } from './Level.js'
import { level1 } from './level1.js'

export class LevelCreator {
  constructor(private random: Random) {}

  create(id: string, size: Size): Level {
    const random = this.random.create(`level-${id}`)
    const layout = createLayout(random, size)
    const level = new Level(id, layout)
    return level
  }
}

function createLayout(random: Random, size: Size): string[][] {
  // TODO - Add more layout generation algorithms and choose one based on the level id or other parameters
  //012345678901234567890123456789012345678901234567890123456789
  const layout = level1
    .replace(/^\n+|\n+$/gm, '')
    .split('\n')
    .map((line) =>
      line
        .padEnd(size.width, ' ')
        .split('')
        .map((char) => {
          const type = Tile.typeForChar(char)
          const def = TileDefinitions.find((def) => def.type === type)
          assert(def, `Unknown tile type: ${type}`)
          return colorize(char, def.color)
        }),
    )

  const emptyRow = ' '.repeat(size.width).split('')
  while (layout.length < size.height) {
    layout.push([...emptyRow])
  }

  return layout
}

// function createLayoutNOISE(random: Random, size: Size): string[][] {
//   const noise2D = createNoise2D(() => random.float())
//   const scale = 0.1

//   const layout: string[][] = []
//   for (let y = 0; y < size.height; y++) {
//     const row: string[] = []
//     for (let x = 0; x < size.width; x++) {
//       const value = noise2D(x * scale, y * scale)
//       // TODO: Colorize the tiles based on the value (e.g. darker for lower values)
//       row.push(value > 0 ? charFor('rock') : charFor('floor'))
//     }
//     layout.push(row)
//   }
//   return layout
// }

function charFor(type: string): string {
  const def = TileDefinitions.find((t) => t.type === type)
  if (!def) {
    throw new Error(`Unknown tile type: ${type}`)
  }
  return def.char
}
