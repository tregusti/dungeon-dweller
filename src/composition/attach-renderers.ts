import { BufferCompositor } from '../buffer/BufferCompositor.js'
import { Layout } from '../Layout.js'
import { Dungeon } from '../levels/Dungeon.js'
import { EventBus, Events } from '../messaging/core/main.js'
import { DungeonRenderer } from '../screen/DungeonRenderer.js'
import { StatusRenderer } from '../screen/StatusRenderer.js'
import { Terminal } from '../screen/Terminal.js'
import { Viewport } from '../screen/Viewport.js'

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

  const viewport = new Viewport(
    Layout.dungeon.size.width,
    Layout.dungeon.size.height,
    Layout.dungeon.scrollMargin,
  )

  const dungeonRenderer = new DungeonRenderer({
    bufferCompositor,
    terminal,
    eventBus,
    dungeon,
    size: Layout.dungeon.size,
    coords: Layout.dungeon.coords,
    viewport,
  })
  dungeonRenderer.attach()
}
