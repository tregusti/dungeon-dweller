import { Monster } from '../../entities/Monster'
import { Position } from '../../types'

export const HeroMovedEventType = Symbol('HeroMoved')
export const MonsterCreatedEventType = Symbol('MonsterCreated')

export const EventType = {
  HeroMoved: HeroMovedEventType,
  MonsterCreated: MonsterCreatedEventType,
} as const

export type EventDef<TPayload> = {
  payload: TPayload
}

export type Events = {
  [EventType.HeroMoved]: EventDef<{ from: Position; to: Position }>
  [EventType.MonsterCreated]: EventDef<{
    monster: Monster
    at: Position
  }>
}

export type EventPayload<TType extends keyof Events> = Events[TType]['payload']
