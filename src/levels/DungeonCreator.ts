import { Hero } from '../entities/Hero.js'
import { MonsterCollection } from '../entities/MonsterCollection.js'
import { Random } from '../Random.js'
import { Size } from '../types.js'
import { Dungeon } from './Dungeon.js'
import { LevelCreator } from './LevelCreator.js'

export class DungeonCreator {
  constructor(
    private random: Random,
    private hero: Hero,
    private monsters: MonsterCollection,
  ) {}

  create(size: Size): Dungeon {
    const levelCreator = new LevelCreator(this.random.create('level-creator'))
    const level1 = levelCreator.create('1', size)
    const level2 = levelCreator.create('2', size)

    // Get start position for hero and place
    // TODO: Get this from the level instead of hardcoding it here
    const heroStart = {
      x: 14,
      y: 5,
    }
    this.hero.moveTo(heroStart.x, heroStart.y, level1.id)

    return new Dungeon(this.hero, this.monsters, [level1, level2])
  }
}
