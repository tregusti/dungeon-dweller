import { Position } from '../types'
import { ActionResult, Creature } from './Creature'

export class Monster extends Creature {
  constructor({ x, y }: Position) {
    // pick random character
    const choices = ['x', 'm', 'M', '&', '£']
    const char = choices[Math.floor(Math.random() * choices.length)]

    // assign default speed for monsters
    const speed = Math.floor(5 + 26 * Math.random()) // 5 to 30

    super({ x, y, char, speed })
  }
  giveEnergy() {
    this._energy += this.speed
  }
  move(): ActionResult {
    // Depending on the monster's behavior, it may gain or lose energy from
    // acting when it is implemented. But for now, just subtract a standard
    // amount for now to keep the turn order moving.
    this._energy -= 10

    return { type: 'noop' }

    //   const from = { x: this.x, y: this.y }
    //   const direction = Math.floor(Math.random() * 4)
    //   const delta: Position = [
    //     { x: 0, y: -1 },
    //     { x: 0, y: 1 },
    //     { x: -1, y: 0 },
    //     { x: 1, y: 0 },
    //   ][direction]
    //   this.x += delta.x
    //   this.y += delta.y
    //   this.resetTickUntilAct()
    //   return { from, to: { x: this.x, y: this.y }, type: 'move' }
  }
}
