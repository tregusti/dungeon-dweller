// Base entity class for all moveable things in the game

export class Entity {
  x: number
  y: number
  char: string
  speed: number
  ticksUntilAct: number

  constructor(x: number, y: number, char: string, speed: number) {
    this.x = x
    this.y = y
    this.char = char
    this.speed = speed
    this.ticksUntilAct = this.speed
  }

  tick(): boolean {
    this.ticksUntilAct--

    if (this.ticksUntilAct <= 0) {
      this.ticksUntilAct = this.speed
      return true // ready to act
    }

    return false
  }
}
