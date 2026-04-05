import { Cell, Coords } from '../types.js'
import { Creature } from './Creature.js'
import { CreatureDefinitions } from './CreatureDefinitions.js'

export type MoveResult = {
  from: Cell
  to: Cell
}

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

  moveTo(coords: Coords, levelId?: string): MoveResult
  moveTo(x: number, y: number, levelId?: string): MoveResult
  moveTo(cell: Cell): MoveResult
  moveTo(
    ...args: [Coords, string?] | [number, number, string?] | [Cell]
  ): MoveResult {
    const from = { x: this.x, y: this.y, levelId: this.levelId }

    if (typeof args[0] === 'number' && typeof args[1] === 'number') {
      this.x = args[0]
      this.y = args[1]
    } else if (typeof args[0] === 'object') {
      this.x = args[0].x
      this.y = args[0].y
      if ('levelId' in args[0]) {
        this.levelId = args[0].levelId
      }
    }

    if (typeof args[2] === 'string') {
      this.levelId = args[2]
    }

    this._energy -= this.speed
    this._turns++

    return {
      from,
      to: { x: this.x, y: this.y, levelId: this.levelId },
    }
  }

  moveBy(dx: number, dy: number): MoveResult {
    const from = { x: this.x, y: this.y, levelId: this.levelId }
    this.x += dx
    this.y += dy

    this._energy -= this.speed
    this._turns++

    return {
      from,
      to: { x: this.x, y: this.y, levelId: this.levelId },
    }
  }
}
