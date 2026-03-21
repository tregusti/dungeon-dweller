import { Hero } from '../../entities/Hero'
import { Monster } from '../../entities/Monster'
import { Position } from '../../types'

const HeroMovedEventType = Symbol('HeroMoved')
const MonsterCreatedEventType = Symbol('MonsterCreated')

export const EventType = {
  HeroMoved: HeroMovedEventType,
  MonsterCreated: MonsterCreatedEventType,
} as const

export type EventDef<TPayload> = {
  payload: TPayload
}

export type Events = {
  [EventType.HeroMoved]: EventDef<{
    from: Position
    to: Position
    hero: Hero
  }>
  [EventType.MonsterCreated]: EventDef<{
    monster: Monster
    at: Position
  }>
}

export type EventPayload<TType extends keyof Events> = Events[TType]['payload']
