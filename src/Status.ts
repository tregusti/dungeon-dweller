import { Buffer } from './buffer/Buffer'
import type { Game } from './Game'
import { Size } from './types'

export class Status {
  readonly width: number
  readonly height: number
  readonly buffer: Buffer

  constructor(size: Size) {
    this.width = size.width
    this.height = size.height
    this.buffer = new Buffer(size)
  }

  update(game: Game) {
    this.buffer.line(0, `Turns: ${game.turns} Monsters: ${game.hero.kills}`)
    this.buffer.line(1, `Energy: ${game.hero.energy}`)
  }
}
