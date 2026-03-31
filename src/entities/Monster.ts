import { Cell, Coords } from '../types.js'
import { Creature, CreatureProps } from './Creature.js'
import { CreatureDefinitions } from './CreatureDefinitions.js'

export class Monster extends Creature {
  static create(type: string, cell: Cell): Monster {
    const definition = CreatureDefinitions.find((def) => def.type === type)
    if (!definition) {
      throw new Error(`Unknown monster type: ${type}`)
    }
    return new Monster({
      ...cell,
      definition,
    })
  }

  constructor({ x, y, levelId, name, definition }: CreatureProps) {
    super({
      x,
      y,
      levelId,
      definition,
      name,
    })
  }
  giveEnergy() {
    this._energy += this.speed
  }
  move(dx: number, dy: number): { from: Coords; to: Coords } {
    const from = { x: this.x, y: this.y }
    this.x += dx
    this.y += dy

    this._energy -= 10

    return {
      from,
      to: { x: this.x, y: this.y },
    }
  }
}
