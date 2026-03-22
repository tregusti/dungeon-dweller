import { Buffer } from '../buffer/Buffer'
import { BufferCompositor } from '../buffer/BufferCompositor'
import type { Game } from '../Game'
import { EventBus, Events, EventType } from '../messaging/core'
import { Size } from '../types'
import { BaseRenderer } from './BaseRenderer'
import { Terminal } from './Terminal'

export class StatusRenderer extends BaseRenderer {
  private readonly buffer: Buffer
  private readonly eventBus: EventBus<Events>

  constructor({
    bufferCompositor,
    terminal,
    eventBus,
    size,
  }: {
    bufferCompositor: BufferCompositor
    terminal: Terminal
    eventBus: EventBus<Events>
    size: Size
  }) {
    super({ bufferCompositor, terminal })
    this.eventBus = eventBus
    this.buffer = new Buffer(size)
  }

  attach() {
    this.bufferCompositor.add({
      buffer: this.buffer,
      x: 0,
      y: 20 + 1,
      z: 1,
    })
    this.buffer.clear()

    this.eventBus.subscribe(EventType.HeroMoved, ({ hero, from, to }) => {
      this.buffer.line(0, `Turns: ${hero.turns} Monsters: ${hero.kills}`)
      this.buffer.line(1, `Energy: ${hero.energy}`)
    })
  }
}
