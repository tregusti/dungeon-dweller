import { Monster } from './Monster'

export class MonsterCollection {
  #monsters: Set<Monster> = new Set()

  sortedByEnergy() {
    return Array.from(this.#monsters).sort((a, b) => a.energy - b.energy)
  }
  all() {
    return Array.from(this.#monsters)
  }

  add(monster: Monster): void {
    this.#monsters.add(monster)
  }

  remove(monster: Monster): void {
    this.#monsters.delete(monster)
  }
}
