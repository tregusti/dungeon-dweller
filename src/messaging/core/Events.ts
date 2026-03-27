import { Hero } from '../../entities/Hero'
import { Monster } from '../../entities/Monster'
import { Cell, Coords } from '../../types'

export type EventDef<TPayload> = {
  payload: TPayload
}

// Always sort by keys alphabetically
export type Events = {
  GameInitialized: EventDef<{
    hero: Hero
  }>
  HeroMoved: EventDef<{
    from: Coords
    to: Coords
    hero: Hero
  }>
  LevelSwitched: EventDef<{
    from: Cell
    to: Cell
    hero: Hero
  }>
  MonsterCreated: EventDef<{
    monster: Monster
    at: Coords
  }>
  MonsterKilled: EventDef<{
    monster: Monster
    at: Coords
  }>
  MonsterMoved: EventDef<{
    from: Coords
    to: Coords
    monster: Monster
  }>
}

export type EventPayload<TType extends keyof Events> = Events[TType]['payload']
