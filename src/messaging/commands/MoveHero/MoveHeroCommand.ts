import { Monster } from '../../../entities/Monster'
import { Position } from '../../../types'
import { CommandDef } from '../../core'

export type MoveHeroPayload = { dx: number; dy: number }
export type MoveHeroResult =
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

export type MoveHeroCommand = CommandDef<
  'MoveHero',
  MoveHeroPayload,
  MoveHeroResult
>
