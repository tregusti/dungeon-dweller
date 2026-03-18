import { Position } from '../../types'

export const EventName = {
  HeroMoved: 'HeroMoved',
  HeroMoveBlocked: 'HeroMoveBlocked',
  HeroAttackedMonster: 'HeroAttackedMonster',
} as const

export type Events = {
  [EventName.HeroMoved]: { from: Position; to: Position }
  [EventName.HeroMoveBlocked]: {
    from: Position
    attemptedTo: Position
    reason: 'wall'
  }
  [EventName.HeroAttackedMonster]: {
    at: Position
    monsterChar: string
  }
}
