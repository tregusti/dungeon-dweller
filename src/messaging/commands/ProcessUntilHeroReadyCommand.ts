import { Hero } from '../../entities/Hero'
import { CommandBus } from '../core/CommandBus'
import { Commands, CommandType } from '../core/Commands'
import { ProcessMonsterRoundCommandResult } from './ProcessMonsterRoundCommand'

export const ProcessUntilHeroReadyCommandType = Symbol('ProcessUntilHeroReady')

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
      const round = await this.commandBus.execute(
        CommandType.ProcessMonsterRound,
      )
      rounds.push(round)
      this.hero.giveEnergy()
    } while (this.hero.energy < this.hero.speed)

    return {
      rounds,
    }
  }
}
