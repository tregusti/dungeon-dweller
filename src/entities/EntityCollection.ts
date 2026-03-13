import { Entity } from './Entity'
import { Hero } from './Hero'

export class EntityCollection {
  #monsters: Set<Entity> = new Set()
  #hero: Hero

  //  TODO: Monster needs to be sorted by ticksUntilAct and a unique ID for efficient scheduling. Maybe use a sorted array instead of a Set

  constructor(hero: Hero) {
    this.#hero = hero
  }

  get all() {
    return [this.#hero, ...this.#monsters]
  }

  get hero() {
    return this.#hero
  }

  get monsters() {
    return Array.from(this.#monsters)
  }

  addMonster(monster: Entity) {
    this.#monsters.add(monster)
  }

  removeMonster(monster: Entity) {
    this.#monsters.delete(monster)
  }
}
