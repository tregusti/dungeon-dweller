import { Hero } from '../../entities/Hero'
import { Monster } from '../../entities/Monster'
import { Position } from '../../types'

const HeroMovedEventType = Symbol('HeroMoved')
const MonsterCreatedEventType = Symbol('MonsterCreated')
const MonsterMovedEventType = Symbol('MonsterMoved')

export const EventType = {
  HeroMoved: HeroMovedEventType,
  MonsterCreated: MonsterCreatedEventType,
  MonsterMoved: MonsterMovedEventType,
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
  [EventType.MonsterMoved]: EventDef<{
    from: Position
    to: Position
    monster: Monster
  }>
}

export type EventPayload<TType extends keyof Events> = Events[TType]['payload']
