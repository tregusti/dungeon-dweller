import { attachRenderers } from './composition/attach-renderers.js'
import { createGameContext } from './composition/create-game-context.js'
import { createInputHandler } from './composition/create-input-handler.js'
import { registerCommandHandlers } from './composition/register-command-handlers.js'
import { Debug } from './Debug.js'

const { random, hero, monsters, dungeon, commandBus, eventBus, terminal } =
  createGameContext()

Debug.initialize({ terminal })

attachRenderers({
  terminal,
  eventBus,
  dungeon,
})

registerCommandHandlers({
  commandBus,
  eventBus,
  dungeon,
  monsters,
  hero,
  random,
})

terminal.on(
  'input',
  createInputHandler({
    commandBus,
    hero,
    exitGame: () => terminal.exit(),
  }),
)

eventBus.publish('GameInitialized', {
  hero,
})
