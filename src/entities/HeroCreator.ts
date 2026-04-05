import { Random } from '../Random.js'
import { Size } from '../types.js'
import { Hero } from './Hero.js'

export class HeroCreator {
  constructor(
    private readonly random: Pick<Random, 'int'>,
    private readonly initialLevelId: string,
  ) {}

  create(): Hero {
    const x = 0
    const y = 0

    return new Hero({ x, y, levelId: this.initialLevelId })
  }
}
