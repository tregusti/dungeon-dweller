import { Monster } from './Monster'

export class MonsterCollection {
  #monsters: Set<Monster> = new Set()

  get all() {
    return Array.from(this.#monsters).sort((a, b) => b.energy - a.energy) // sort by energy descending
  }

  add(monster: Monster): void {
    this.#monsters.add(monster)
  }

  remove(monster: Monster): void {
    this.#monsters.delete(monster)
  }
}
