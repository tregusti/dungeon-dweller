import { Buffer } from '../buffer/Buffer'
import { BufferCompositor } from '../buffer/BufferCompositor'
import { EventBus, Events, EventType } from '../messaging/core'
import { Position, Size } from '../types'
import { BaseRenderer } from './BaseRenderer'
import { Terminal } from './Terminal'

export class DungeonRenderer extends BaseRenderer {
  private readonly buffer: Buffer
  private readonly eventBus: EventBus<Events>

  constructor({
    bufferCompositor,
    terminal,
    eventBus,
    size,
    position,
  }: {
    bufferCompositor: BufferCompositor
    terminal: Terminal
    eventBus: EventBus<Events>
    size: Size
    position: Position
  }) {
    super({ bufferCompositor, terminal })
    this.eventBus = eventBus
    this.buffer = bufferCompositor.add({
      buffer: new Buffer(size),
      x: position.x,
      y: position.y,
      layer: 0,
    })
    this.buffer.clear()
  }

  attach() {
    this.eventBus.subscribe(EventType.GameInitialized, ({ hero }) => {
      this.buffer.set(hero.x, hero.y, hero.char)
      this.redraw()
    })
    this.eventBus.subscribe(EventType.HeroMoved, ({ hero, from, to }) => {
      this.buffer.clear(from.x, from.y)
      this.buffer.set(to.x, to.y, hero.char)
      this.redraw()
    })
    this.eventBus.subscribe(EventType.MonsterCreated, ({ monster, at }) => {
      this.buffer.set(at.x, at.y, monster.char)
      this.redraw()
    })
    this.eventBus.subscribe(EventType.MonsterKilled, ({ at }) => {
      this.buffer.clear(at.x, at.y)
      this.redraw()
    })
    this.eventBus.subscribe(EventType.MonsterMoved, ({ monster, from, to }) => {
      this.buffer.clear(from.x, from.y)
      this.buffer.set(to.x, to.y, monster.char)
      this.redraw()
    })
  }
}
