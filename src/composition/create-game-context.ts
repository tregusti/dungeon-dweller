import type { Hero } from '../entities/Hero.js'
import { HeroCreator } from '../entities/HeroCreator.js'
import { MonsterCollection } from '../entities/MonsterCollection.js'
import { Layout } from '../Layout.js'
import { Dungeon } from '../levels/Dungeon.js'
import { DungeonCreator } from '../levels/DungeonCreator.js'
import { CommandBus, Commands, EventBus, Events } from '../messaging/core/main.js'
import { Random } from '../Random.js'
import { Terminal } from '../screen/Terminal.js'

export type GameContext = {
  random: Random
  hero: Hero
  monsters: MonsterCollection
  dungeon: Dungeon
  commandBus: CommandBus<Commands>
  eventBus: EventBus<Events>
  terminal: Terminal
}

export function createGameContext(): GameContext {
  const random = new Random('lenn-seed')
  const levelSize = Layout.levels.defaultSize

  const heroCreator = new HeroCreator(
    levelSize,
    random.create('create-hero'),
    '1',
  )
  const hero = heroCreator.create()
  const monsters = new MonsterCollection()
  const dungeonCreator = new DungeonCreator(
    random.create('dungeon-creator'),
    hero,
    monsters,
  )
  const dungeon = dungeonCreator.create(levelSize)

  const commandBus = new CommandBus<Commands>()
  const eventBus = new EventBus<Events>()
  const terminal = new Terminal(Layout.game.size.width, Layout.game.size.height)

  return {
    random,
    hero,
    monsters,
    dungeon,
    commandBus,
    eventBus,
    terminal,
  }
}
