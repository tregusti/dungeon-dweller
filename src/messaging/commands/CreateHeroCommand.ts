import { Hero } from '../../entities/Hero'
import { RandomGenerator } from '../../Random'
import { Size } from '../../types'
import type { CommandDef } from '../core/Commands'

declare module '../core/Commands' {
  interface Commands {
    CreateHero: CommandDef<CreateHeroCommandPayload, CreateHeroCommandResult>
  }
}

export type CreateHeroCommandPayload = void

export type CreateHeroCommandResult = {
  success: true
  hero: Hero
}

export class CreateHeroCommandHandler {
  constructor(
    private readonly dungeon: Readonly<Size>,
    private readonly random: Pick<RandomGenerator, 'int'>,
    private readonly startingLevelId: string,
  ) {}

  handle(): CreateHeroCommandResult {
    const x = this.random.int(this.dungeon.width - 1)
    const y = this.random.int(this.dungeon.height - 1)

    return {
      success: true,
      hero: new Hero({ x, y, levelId: this.startingLevelId }),
    }
  }
}
