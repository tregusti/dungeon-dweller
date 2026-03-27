import { BufferCompositor } from '../buffer/BufferCompositor'
import { Layout } from '../Layout'
import { Dungeon } from '../levels/Dungeon'
import { EventBus, Events } from '../messaging/core'
import { DungeonRenderer } from '../screen/DungeonRenderer'
import { StatusRenderer } from '../screen/StatusRenderer'
import { Terminal } from '../screen/Terminal'

type AttachRenderersArgs = {
  terminal: Terminal
  eventBus: EventBus<Events>
  dungeon: Dungeon
}

export function attachRenderers({
  terminal,
  eventBus,
  dungeon,
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
    coords: Layout.status.coords,
  })
  statusRenderer.attach()

  const dungeonRenderer = new DungeonRenderer({
    bufferCompositor,
    terminal,
    eventBus,
    dungeon,
    size: Layout.dungeon.size,
    coords: Layout.dungeon.coords,
    scrollMargin: Layout.dungeon.scrollMargin,
  })
  dungeonRenderer.attach()
}
