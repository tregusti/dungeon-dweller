import { Position } from '../../types'

export const EventType = {
  HeroMoved: Symbol('HeroMoved'),
} as const

export type Events = {
  [EventType.HeroMoved]: { from: Position; to: Position }
}
