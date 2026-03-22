import { MonsterCollection } from '../entities/EntityCollection'
import { Game } from '../Game'
import { Layout } from '../Layout'
import { Dungeon } from '../levels/Dungeon'
import { CreateHeroCommandHandler } from '../messaging/commands/CreateHero'
import { CommandBus, Commands, EventBus, Events } from '../messaging/core'
import { Random } from '../Random'
import { Terminal } from '../screen/Terminal'

export type GameContext = {
  random: Random
  hero: ReturnType<CreateHeroCommandHandler['handle']>['hero']
  monsters: MonsterCollection
  dungeon: Dungeon
  game: Game
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
  const game = new Game(dungeon)
  const commandBus = new CommandBus<Commands>()
  const eventBus = new EventBus<Events>()
  const terminal = new Terminal(game.width, game.height)

  return {
    random,
    hero,
    monsters,
    dungeon,
    game,
    commandBus,
    eventBus,
    terminal,
  }
}
