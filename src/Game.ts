import { Debug } from './Debug'
import { MonsterCollection } from './entities/EntityCollection'
import { Hero } from './entities/Hero'
import { Monster } from './entities/Monster'
import { DeepReadonly, Size } from './types'

type GameOptions = {
  dungeon: Size
  status: Size
}

export class Game implements Readonly<Size> {
  readonly dungeon: Readonly<Size>
  readonly status: Readonly<Size>
  readonly width: number
  readonly height: number
  readonly hero: Hero
  readonly monsters: MonsterCollection
  private _turns: number = 0

  constructor({ dungeon, status }: DeepReadonly<GameOptions>) {
    this.width = Math.max(dungeon.width, status.width)
    this.height = dungeon.height + status.height
    this.dungeon = dungeon
    this.status = status
    this.hero = new Hero({
      x: Math.floor(dungeon.width / 2),
      y: Math.floor(dungeon.height / 2),
    })
    this.monsters = new MonsterCollection()
  }

  get turns() {
    return this._turns
  }
  advanceTurn() {
    this._turns++
  }

  processMonsterTurn() {
    const monsters = this.monsters.all.slice()
    monsters.forEach((mon) => mon.giveEnergy())

    let mon: Monster | undefined
    while ((mon = monsters.shift())) {
      if (mon.energy >= this.hero.speed) {
        Debug.write(
          `${mon.char} acts at turn ${this._turns}! (energy: ${mon.energy} speed: ${mon.speed})`,
        )
        mon.move()
        if (mon.energy >= this.hero.speed) {
          monsters.push(mon) // still has energy to act again
        }
      }
    }
  }
}
