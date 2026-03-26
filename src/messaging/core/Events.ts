import { Hero } from '../../entities/Hero'
import { Monster } from '../../entities/Monster'
import { Position, Spot } from '../../types'

export type EventDef<TPayload> = {
  payload: TPayload
}

// Always sort by keys alphabetically
export type Events = {
  GameInitialized: EventDef<{
    hero: Hero
  }>
  HeroMoved: EventDef<{
    from: Position
    to: Position
    hero: Hero
  }>
  LevelSwitched: EventDef<{
    from: Spot
    to: Spot
    hero: Hero
  }>
  MonsterCreated: EventDef<{
    monster: Monster
    at: Position
  }>
  MonsterKilled: EventDef<{
    monster: Monster
    at: Position
  }>
  MonsterMoved: EventDef<{
    from: Position
    to: Position
    monster: Monster
  }>
}

export type EventPayload<TType extends keyof Events> = Events[TType]['payload']
