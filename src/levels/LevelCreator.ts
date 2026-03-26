import { createNoise2D } from 'simplex-noise'

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
      row.push(value > 0 ? '#' : '.')
    }
    layout.push(row)
  }
  return layout
}
