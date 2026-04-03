import { Random } from '../Random.js'
import { Size } from '../types.js'
import { Level } from './Level.js'
import { level1 } from './predefined/level1.js'
import { level2 } from './predefined/level2.js'

export class LevelCreator {
  constructor(private random: Random) {}

  create(id: string, size: Size): Level {
    // TODO - Add more layout generation algorithms and choose one based on the level id or other parameters
    const random = this.random.create(`level-${id}`)
    const layout = getLayout(id)
    const level = Level.fromLayout(id, layout)
    return level
  }
}

function getLayout(id: string): string {
  // TODO - Add more predefined layouts and choose one based on the level id or other parameters
  if (id === '1') {
    return level1
  }
  if (id === '2') {
    return level2
  }
  throw new Error(`Unknown level id: ${id}`)
}
