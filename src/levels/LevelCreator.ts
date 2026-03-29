import { createNoise2D } from 'simplex-noise'

import { TileDefinitions, TileTypes } from '../entities/Tile'
import { Random } from '../Random'
import { Size } from '../types'
import { Level } from './Level'

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
  const noise2D = createNoise2D(() => random.float())
  const scale = 0.1

  const layout: string[][] = []
  for (let y = 0; y < size.height; y++) {
    const row: string[] = []
    for (let x = 0; x < size.width; x++) {
      const value = noise2D(x * scale, y * scale)
      // TODO: Colorize the tiles based on the value (e.g. darker for lower values)
      row.push(value > 0 ? charFor('rock') : charFor('floor'))
    }
    layout.push(row)
  }
  return layout
}

function charFor(type: string): string {
  const def = TileDefinitions.find((t) => t.type === type)
  if (!def) {
    throw new Error(`Unknown tile type: ${type}`)
  }
  return def.char
}
