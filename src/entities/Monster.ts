import { ActionResult, Entity } from './Entity'
import { Position } from '../types'

export class Monster extends Entity {
  constructor({ x, y }: Position) {
    // pick random character
    const choices = ['x', 'm', 'M', '&', '£']
    const char = choices[Math.floor(Math.random() * choices.length)]

    // assign default speed for monsters
    const speed = 10

    super({ x, y, char, speed })
  }
  // private resetTickUntilAct() {
  //   this.ticksUntilAct = this.speed
  // }

  // move(): ActionResult {
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
  // }
}
