import { attachRenderers } from './composition/attach-renderers'
import { createGameContext } from './composition/create-game-context'
import { createInputHandler } from './composition/create-input-handler'
import { registerCommandHandlers } from './composition/register-command-handlers'
import { Debug } from './Debug'
import { EventType } from './messaging/core'

const {
  random,
  hero,
  monsters,
  dungeon,
  game,
  commandBus,
  eventBus,
  terminal,
} = createGameContext()

Debug.initialize({ terminal, game })

const { forceRedrawForInvalidTerminal } = attachRenderers({
  game,
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

let gameEnabled = false

const onInput = createInputHandler({
  commandBus,
  hero,
  isGameEnabled: () => gameEnabled,
  exitGame: () => terminal.exit(),
})

terminal.on('invalid', () => {
  gameEnabled = false
})

terminal.on('valid', () => {
  forceRedrawForInvalidTerminal()
  gameEnabled = true
})

terminal.on('input', onInput)

void startGame()

async function startGame() {
  await eventBus.publish(EventType.GameInitialized, {
    hero,
  })
  gameEnabled = true
}
