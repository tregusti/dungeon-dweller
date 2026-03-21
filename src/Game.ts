import { Debug } from './Debug'
import { MonsterCollection } from './entities/EntityCollection'
import { Hero } from './entities/Hero'
import { Monster } from './entities/Monster'
import { Dungeon } from './levels/Dungeon'
import { Status } from './Status'
import { MaybePromise, Size } from './types'

export class Game implements Readonly<Size> {
  readonly dungeon: Dungeon
  readonly status: Readonly<Size>
  readonly width: number
  readonly height: number
  readonly hero: Hero
  readonly monsters: MonsterCollection
  private _turns: number = 0

  constructor(
    dungeon: Dungeon,
    status: Status,
    hero: Hero,
    monsters: MonsterCollection,
  ) {
    this.width = Math.max(dungeon.width, status.width)
    this.height = dungeon.height + status.height
    this.dungeon = dungeon
    this.status = status
    this.hero = hero
    this.monsters = monsters
  }

  get turns() {
    return this._turns
  }
  advanceTurn() {
    this._turns++
  }

  async processMonsterTurn(
    onMonsterAct: (monster: Monster) => MaybePromise<void>,
  ) {
    const monsters = this.monsters.all.slice()
    monsters.forEach((mon) => mon.giveEnergy())

    let mon: Monster | undefined
    while ((mon = monsters.shift())) {
      if (mon.energy >= this.hero.speed) {
        await onMonsterAct(mon)
        if (mon.energy >= this.hero.speed) {
          monsters.push(mon) // still has energy to act again
        }
      }
    }
  }
}
