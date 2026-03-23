import { Hero } from '../../entities/Hero'
import { RandomGenerator } from '../../Random'
import { Size } from '../../types'

export const CreateHeroCommandType = Symbol('CreateHero')

export type CreateHeroCommandPayload = void

export type CreateHeroCommandResult = {
  success: true
  hero: Hero
}

export class CreateHeroCommandHandler {
  constructor(
    private readonly dungeon: Readonly<Size>,
    private readonly random: RandomGenerator,
  ) {}

  handle(): CreateHeroCommandResult {
    const x = this.random.int(this.dungeon.width - 1)
    const y = this.random.int(this.dungeon.height - 1)

    return {
      success: true,
      hero: new Hero({ x, y }),
    }
  }
}
