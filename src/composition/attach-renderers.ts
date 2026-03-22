import { BufferCompositor } from '../buffer/BufferCompositor'
import { Game } from '../Game'
import { Layout } from '../Layout'
import { EventBus, Events } from '../messaging/core'
import { DungeonRenderer } from '../screen/DungeonRenderer'
import { StatusRenderer } from '../screen/StatusRenderer'
import { Terminal } from '../screen/Terminal'

type AttachRenderersArgs = {
  game: Game
  terminal: Terminal
  eventBus: EventBus<Events>
}

export function attachRenderers({
  game,
  terminal,
  eventBus,
}: AttachRenderersArgs): void {
  const bufferCompositor = new BufferCompositor({
    width: game.width,
    height: game.height,
  })

  const statusRenderer = new StatusRenderer({
    bufferCompositor,
    terminal,
    eventBus,
    size: Layout.status.size,
    position: Layout.status.position,
  })
  statusRenderer.attach()

  const dungeonRenderer = new DungeonRenderer({
    bufferCompositor,
    terminal,
    eventBus,
    size: Layout.dungeon.size,
    position: Layout.dungeon.position,
  })
  dungeonRenderer.attach()
}
