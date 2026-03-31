import { Hero } from '../../entities/Hero.js'
import { CommandBus } from '../core/CommandBus.js'
import type { CommandDef, Commands } from '../core/Commands.js'
import { ProcessMonsterRoundCommandResult } from './ProcessMonsterRoundCommand.js'

declare module '../core/Commands.js' {
  interface Commands {
    ProcessUntilHeroReady: CommandDef<
      ProcessUntilHeroReadyCommandPayload,
      ProcessUntilHeroReadyCommandResult
    >
  }
}

export type ProcessUntilHeroReadyCommandPayload = void

export type ProcessUntilHeroReadyCommandResult = {
  rounds: ProcessMonsterRoundCommandResult[]
}

export class ProcessUntilHeroReadyCommandHandler {
  constructor(
    private readonly hero: Hero,
    private readonly commandBus: CommandBus<Commands>,
  ) {}

  async handle(): Promise<ProcessUntilHeroReadyCommandResult> {
    const rounds: ProcessUntilHeroReadyCommandResult['rounds'] = []

    do {
      const round = await this.commandBus.execute('ProcessMonsterRound')
      rounds.push(round)
      this.hero.giveEnergy()
    } while (this.hero.energy < this.hero.speed)

    return {
      rounds,
    }
  }
}
