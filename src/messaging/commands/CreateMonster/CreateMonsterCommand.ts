import { Monster } from '../../../entities/Monster'

export const CreateMonsterCommandType = Symbol('CreateMonster')

export type CreateMonsterCommandPayload = void

export type CreateMonsterCommandResult =
  | {
      success: false
      reason: 'dungeon-full'
    }
  | {
      success: true
      monster: Monster
    }
