import { Entity } from './Entity'

export class Monster extends Entity {
  constructor(x: number, y: number, currentTick: number) {
    // pick random character
    const choices = ['x', 'm', 'M', '&', '£']
    const char = choices[Math.floor(Math.random() * choices.length)]

    // assign default speed for monsters
    const speed = 4

    super(x, y, char, speed, currentTick + speed)
  }
}
