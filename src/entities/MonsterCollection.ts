import { Monster } from './Monster.js'

export class MonsterCollection {
  #monsters: Set<Monster> = new Set()

  list({ levelId, sortBy }: { levelId?: string; sortBy?: 'energy' } = {}) {
    let monsters = Array.from(this.#monsters)
    if (levelId) {
      monsters = monsters.filter((m) => m.levelId === levelId)
    }
    if (sortBy === 'energy') {
      monsters = monsters.sort((a, b) => a.energy - b.energy)
    }
    return monsters
  }

  add(monster: Monster): void {
    this.#monsters.add(monster)
  }

  remove(monster: Monster): void {
    this.#monsters.delete(monster)
  }
}
