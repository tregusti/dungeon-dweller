import { Monster } from './Monster'

export class MonsterCollection {
  #monsters: Set<Monster> = new Set()

  list({ level, sortBy }: { level?: string; sortBy?: 'energy' } = {}) {
    let monsters = Array.from(this.#monsters)
    if (level) {
      monsters = monsters.filter((m) => m.level === level)
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
