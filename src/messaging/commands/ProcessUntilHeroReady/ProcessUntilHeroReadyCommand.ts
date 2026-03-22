import { ProcessMonsterRoundCommandResult } from '../ProcessMonsterRound'

export const ProcessUntilHeroReadyCommandType = Symbol('ProcessUntilHeroReady')

export type ProcessUntilHeroReadyCommandPayload = void

export type ProcessUntilHeroReadyCommandResult = {
  rounds: ProcessMonsterRoundCommandResult[]
}
