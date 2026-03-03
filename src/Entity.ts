// Base entity class for all moveable things in the game

export class Entity {
  x: number
  y: number
  char: string
  speed: number
  nextTick: number

  constructor(x: number, y: number, char: string, speed: number, nextTick: number = 0) {
    this.x = x
    this.y = y
    this.char = char
    this.speed = speed
    this.nextTick = nextTick
  }

  // Placeholder for future tick-based behavior
  tick(): void {
    // subclasses override this to handle actions at their scheduled tick
  }
}
