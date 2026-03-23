import { BufferCompositor } from '../buffer/BufferCompositor'
import { Layout } from '../Layout'
import { EventBus, Events } from '../messaging/core'
import { DungeonRenderer } from '../screen/DungeonRenderer'
import { StatusRenderer } from '../screen/StatusRenderer'
import { Terminal } from '../screen/Terminal'

type AttachRenderersArgs = {
  terminal: Terminal
  eventBus: EventBus<Events>
}

export function attachRenderers({
  terminal,
  eventBus,
}: AttachRenderersArgs): void {
  const bufferCompositor = new BufferCompositor({
    width: Layout.game.size.width,
    height: Layout.game.size.height,
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
