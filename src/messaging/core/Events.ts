import { Hero } from '../../entities/Hero.js'
import { Monster } from '../../entities/Monster.js'
import { Cell, Coords } from '../../types.js'

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

export type EventHandler<TType extends keyof Events> = (
  payload: EventPayload<TType>,
) => void | Promise<void>
