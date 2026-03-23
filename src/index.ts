import { attachRenderers } from './composition/attach-renderers'
import { createGameContext } from './composition/create-game-context'
import { createInputHandler } from './composition/create-input-handler'
import { registerCommandHandlers } from './composition/register-command-handlers'
import { Debug } from './Debug'
import { EventType } from './messaging/core'

const { random, hero, monsters, dungeon, commandBus, eventBus, terminal } =
  createGameContext()

Debug.initialize({ terminal })

attachRenderers({
  terminal,
  eventBus,
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

eventBus.publish(EventType.GameInitialized, {
  hero,
})
