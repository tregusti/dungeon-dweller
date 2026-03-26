import { Buffer } from '../buffer/Buffer'
import { BufferCompositor } from '../buffer/BufferCompositor'
import { Hero } from '../entities/Hero'
import { EventBus, Events } from '../messaging/core'
import { Position, Size } from '../types'
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

    this.buffer = this.bufferCompositor.add({
      buffer: new Buffer(size),
      x: position.x,
      y: position.y,
      layer: 1,
    })
    this.buffer.clear()
  }

  attach() {
    this.eventBus.subscribe('GameInitialized', ({ hero }) => {
      this.renderStatus(hero)
    })
    this.eventBus.subscribe('HeroMoved', ({ hero }) => {
      this.renderStatus(hero)
    })
    this.eventBus.subscribe('LevelSwitched', ({ hero }) => {
      this.renderStatus(hero)
    })
  }

  private renderStatus(hero: Hero) {
    this.buffer.line(0, `Turns: ${hero.turns} Monsters: ${hero.kills}`)
    this.buffer.line(1, `x: ${hero.x} y: ${hero.y} Level: ${hero.levelId}`)
    this.buffer.line(2, `Energy: ${hero.energy}`)
    this.redraw()
  }
}
