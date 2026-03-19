import { Monster } from '../../../entities/Monster'
import { Position } from '../../../types'

export const MoveHeroCommandType = Symbol('MoveHero')

export type MoveHeroCommandPayload = { dx: number; dy: number }
export type MoveHeroCommandResult =
  | {
      success: false
      reason: 'wall'
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
