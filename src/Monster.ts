import { Entity } from './Entity'
import { Position } from './types'

export class Monster extends Entity {
  constructor({ x, y }: Position) {
    // pick random character
    const choices = ['x', 'm', 'M', '&', '£']
    const char = choices[Math.floor(Math.random() * choices.length)]

    // assign default speed for monsters
    const speed = 4

    super({ x, y, char, speed })
  }
}
