import { Random } from '../Random.js'
import { Size } from '../types.js'
import { Hero } from './Hero.js'

export class HeroCreator {
  constructor(
    private readonly levelSize: Readonly<Size>,
    private readonly random: Pick<Random, 'int'>,
    private readonly initialLevelId: string,
  ) {}

  create(): Hero {
    const x = this.random.int(this.levelSize.width - 1)
    const y = this.random.int(this.levelSize.height - 1)

    return new Hero({ x, y, levelId: this.initialLevelId })
  }
}
