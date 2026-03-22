import { Buffer } from '../buffer/Buffer'
import { BufferCompositor } from '../buffer/BufferCompositor'
import { EventBus, EventType } from '../messaging/core'
import type { Events } from '../messaging/core'
import { BaseRenderer } from './BaseRenderer'
import { Terminal } from './Terminal'

export class DungeonRenderer extends BaseRenderer {
  private readonly dungeonBuffer: Buffer
  private readonly eventBus: EventBus<Events>

  constructor({
    bufferCompositor,
    terminal,
    eventBus,
    dungeonBuffer,
  }: {
    bufferCompositor: BufferCompositor
    terminal: Terminal
    eventBus: EventBus<Events>
    dungeonBuffer: Buffer
  }) {
    super({ bufferCompositor, terminal })
    this.eventBus = eventBus
    this.dungeonBuffer = dungeonBuffer
  }

  attach() {
    this.eventBus.subscribe(EventType.HeroMoved, ({ hero, from, to }) => {
      this.dungeonBuffer.clear(from.x, from.y)
      this.dungeonBuffer.set(to.x, to.y, hero.char)
      this.redraw()
    })
    this.eventBus.subscribe(EventType.MonsterCreated, ({ monster, at }) => {
      this.dungeonBuffer.set(at.x, at.y, monster.char)
      this.redraw()
    })
    this.eventBus.subscribe(EventType.MonsterMoved, ({ monster, from, to }) => {
      this.dungeonBuffer.clear(from.x, from.y)
      this.dungeonBuffer.set(to.x, to.y, monster.char)
      this.redraw()
    })
  }
}
