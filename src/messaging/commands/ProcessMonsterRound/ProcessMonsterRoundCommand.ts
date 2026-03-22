import { Monster } from '../../../entities/Monster'
import { MoveMonsterCommandResult } from '../MoveMonster'

export const ProcessMonsterRoundCommandType = Symbol('ProcessMonsterRound')

export type ProcessMonsterRoundCommandPayload = void

export type ProcessMonsterRoundAction = {
  monster: Monster
  result: MoveMonsterCommandResult
}

export type ProcessMonsterRoundCommandResult = {
  actions: ProcessMonsterRoundAction[]
}
