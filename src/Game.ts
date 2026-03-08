export class Game {
  private _tick = 0
  get tick() {
    return this._tick
  }
  advance() {
    this._tick++
  }
}
