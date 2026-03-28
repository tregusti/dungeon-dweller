import type { Hero } from '../entities/Hero'
import { HeroCreator } from '../entities/HeroCreator'
import { MonsterCollection } from '../entities/MonsterCollection'
import { Layout } from '../Layout'
import { Dungeon } from '../levels/Dungeon'
import { DungeonCreator } from '../levels/DungeonCreator'
import { CommandBus, Commands, EventBus, Events } from '../messaging/core'
import { Random } from '../Random'
import { Terminal } from '../screen/Terminal'

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
