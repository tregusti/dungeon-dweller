import { Hero } from '../../../entities/Hero'
import { Monster } from '../../../entities/Monster'
import { Position } from '../../../types'

export const MoveMonsterCommandType = Symbol('MoveMonster')

export type MoveMonsterCommandPayload = {
  monster: Monster
}

export type MoveMonsterCommandResult =
  | {
      success: false
      reason: 'wall'
    }
  | {
      success: false
      reason: 'hero'
      hero: Hero
    }
  | {
      success: false
      reason: 'monster'
      monster: Monster
    }
  | {
      success: true
      from: Position
      to: Position
    }
