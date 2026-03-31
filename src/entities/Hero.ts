import { Cell, Coords } from '../types.js'
import { Creature } from './Creature.js'
import { CreatureDefinitions } from './CreatureDefinitions.js'

export class Hero extends Creature {
  kills: number = 0
  _turns: number = 0

  get turns() {
    return this._turns
  }

  constructor({ x, y, levelId }: Cell) {
    super({
      x,
      y,
      levelId,
      definition: CreatureDefinitions.find((def) => def.type === 'human')!,
    })
    // For hero, energy starts at full so they can act immediately
    this._energy = this.speed
    this.char = '@'
    this.description = 'You, the intrepid adventurer.'
  }

  giveEnergy() {
    this._energy += this.speed
  }

  move(dx: number, dy: number): { from: Coords; to: Coords } {
    const from = { x: this.x, y: this.y }
    this.x += dx
    this.y += dy

    this._energy -= this.speed
    this._turns++

    return {
      from,
      to: { x: this.x, y: this.y },
    }
  }
}
