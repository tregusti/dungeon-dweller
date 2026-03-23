import { Hero } from '../../entities/Hero'
import { Monster } from '../../entities/Monster'
import { Position } from '../../types'

// Always sort these names alphabetically
const GameInitializedEventType = Symbol('GameInitialized')
const HeroMovedEventType = Symbol('HeroMoved')
const MonsterCreatedEventType = Symbol('MonsterCreated')
const MonsterKilledEventType = Symbol('MonsterKilled')
const MonsterMovedEventType = Symbol('MonsterMoved')

// Always sort by keys alphabetically
export const EventType = {
  GameInitialized: GameInitializedEventType,
  HeroMoved: HeroMovedEventType,
  MonsterCreated: MonsterCreatedEventType,
  MonsterKilled: MonsterKilledEventType,
  MonsterMoved: MonsterMovedEventType,
} as const

export type EventDef<TPayload> = {
  payload: TPayload
}

// Always sort by keys alphabetically
export type Events = {
  [EventType.GameInitialized]: EventDef<{
    hero: Hero
  }>
  [EventType.HeroMoved]: EventDef<{
    from: Position
    to: Position
    hero: Hero
  }>
  [EventType.MonsterCreated]: EventDef<{
    monster: Monster
    at: Position
  }>
  [EventType.MonsterKilled]: EventDef<{
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
