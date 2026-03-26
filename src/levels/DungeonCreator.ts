import { Hero } from '../entities/Hero'
import { MonsterCollection } from '../entities/MonsterCollection'
import { Random } from '../Random'
import { Size } from '../types'
import { Dungeon } from './Dungeon'
import { LevelCreator } from './LevelCreator'

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

    return new Dungeon(size, this.hero, this.monsters, [level1, level2])
  }
}
