import type { Hero } from '../entities/Hero'
import { MonsterCollection } from '../entities/MonsterCollection'
import { Layout } from '../Layout'
import { Dungeon } from '../levels/Dungeon'
import { CreateHeroCommandHandler } from '../messaging/commands/CreateHeroCommand'
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

  const createHeroCommandHandler = new CreateHeroCommandHandler(
    Layout.dungeon.size,
    random.create('create-hero'),
  )
  const hero = createHeroCommandHandler.handle().hero
  const monsters = new MonsterCollection()
  const dungeon = new Dungeon(Layout.dungeon.size, hero, monsters)
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
