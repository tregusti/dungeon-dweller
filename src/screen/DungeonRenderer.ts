import { Buffer } from '../buffer/Buffer'
import { BufferCompositor } from '../buffer/BufferCompositor'
import { Dungeon } from '../levels/Dungeon'
import { EventBus, Events } from '../messaging/core'
import { Position, Size } from '../types'
import { BaseRenderer } from './BaseRenderer'
import { Terminal } from './Terminal'

type DungeonRendererArgs = {
  bufferCompositor: BufferCompositor
  terminal: Terminal
  eventBus: EventBus<Events>
  size: Size
  position: Position
  dungeon: Dungeon
}

export class DungeonRenderer extends BaseRenderer {
  private readonly levelBuffer: Buffer
  private readonly entityBuffer: Buffer
  private readonly eventBus: EventBus<Events>
  private readonly dungeon: Dungeon

  constructor({
    bufferCompositor,
    terminal,
    eventBus,
    size,
    position,
    dungeon,
  }: DungeonRendererArgs) {
    super({ bufferCompositor, terminal })
    this.eventBus = eventBus
    this.dungeon = dungeon

    this.levelBuffer = bufferCompositor.add({
      buffer: new Buffer(size),
      x: position.x,
      y: position.y,
      layer: 0,
    })
    this.levelBuffer.clear()

    this.entityBuffer = bufferCompositor.add({
      buffer: new Buffer(size),
      x: position.x,
      y: position.y,
      layer: 1,
    })
    this.entityBuffer.clear()
  }

  attach() {
    this.eventBus.subscribe('GameInitialized', ({ hero }) => {
      this.updateLevelBuffer(hero.levelId)
      this.entityBuffer.set(hero.x, hero.y, hero.char)
      this.redraw()
    })
    this.eventBus.subscribe('HeroMoved', ({ hero, from, to }) => {
      this.entityBuffer.clear(from.x, from.y)
      this.entityBuffer.set(to.x, to.y, hero.char)
      this.redraw()
    })
    this.eventBus.subscribe('MonsterCreated', ({ monster, at }) => {
      this.entityBuffer.set(at.x, at.y, monster.char)
      this.redraw()
    })
    this.eventBus.subscribe('MonsterKilled', ({ at }) => {
      this.entityBuffer.clear(at.x, at.y)
      this.redraw()
    })
    this.eventBus.subscribe('MonsterMoved', ({ monster, from, to }) => {
      this.entityBuffer.clear(from.x, from.y)
      this.entityBuffer.set(to.x, to.y, monster.char)
      this.redraw()
    })
    this.eventBus.subscribe('LevelSwitched', ({ hero, to }) => {
      this.updateLevelBuffer(to.levelId)
      this.entityBuffer.clear()
      this.entityBuffer.set(to.x, to.y, hero.char)
      this.redraw()
    })
  }

  private updateLevelBuffer(levelId: string) {
    const level = this.dungeon.getLevel(levelId)
    for (let y = 0; y < this.levelBuffer.height; y++) {
      for (let x = 0; x < this.levelBuffer.width; x++) {
        this.levelBuffer.set(x, y, level.at(x, y))
      }
    }
  }
}
