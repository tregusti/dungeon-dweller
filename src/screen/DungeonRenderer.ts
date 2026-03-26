import { Buffer } from '../buffer/Buffer'
import { BufferCompositor } from '../buffer/BufferCompositor'
import { Dungeon } from '../levels/Dungeon'
import { EventBus, Events } from '../messaging/core'
import { Position, Size } from '../types'
import { BaseRenderer } from './BaseRenderer'
import { Terminal } from './Terminal'
import { Viewport } from './Viewport'

type DungeonRendererArgs = {
  bufferCompositor: BufferCompositor
  terminal: Terminal
  eventBus: EventBus<Events>
  size: Size
  position: Position
  scrollMargin: Position
  dungeon: Dungeon
}

export class DungeonRenderer extends BaseRenderer {
  private readonly levelBuffer: Buffer
  private readonly entityBuffer: Buffer
  private readonly eventBus: EventBus<Events>
  private readonly dungeon: Dungeon
  private readonly viewport: Viewport
  private heroPosition: Position | null = null

  constructor({
    bufferCompositor,
    terminal,
    eventBus,
    size,
    position,
    scrollMargin,
    dungeon,
  }: DungeonRendererArgs) {
    super({ bufferCompositor, terminal })
    this.eventBus = eventBus
    this.dungeon = dungeon
    this.viewport = new Viewport(size.width, size.height, scrollMargin)

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
      this.heroPosition = { x: hero.x, y: hero.y }
      this.renderScene()
      this.redraw()
    })
    this.eventBus.subscribe('HeroMoved', ({ hero, to }) => {
      this.heroPosition = { x: to.x, y: to.y }
      this.renderScene()
      this.redraw()
    })
    this.eventBus.subscribe('MonsterCreated', ({ monster }) => {
      if (monster.levelId !== this.dungeon.currentLevel.id) {
        return
      }

      this.updateEntityBuffer()
      this.redraw()
    })
    this.eventBus.subscribe('MonsterKilled', ({ monster }) => {
      if (monster.levelId !== this.dungeon.currentLevel.id) {
        return
      }

      this.updateEntityBuffer()
      this.redraw()
    })
    this.eventBus.subscribe('MonsterMoved', ({ monster }) => {
      if (monster.levelId !== this.dungeon.currentLevel.id) {
        return
      }

      this.updateEntityBuffer()
      this.redraw()
    })
    this.eventBus.subscribe('LevelSwitched', ({ to }) => {
      this.heroPosition = { x: to.x, y: to.y }
      this.renderScene()
      this.redraw()
    })
  }

  private renderScene() {
    if (!this.heroPosition) {
      return
    }

    const level = this.dungeon.currentLevel
    this.viewport.update(this.heroPosition, {
      width: level.width,
      height: level.height,
    })
    this.updateLevelBuffer(level)
    this.updateEntityBuffer()
  }

  private updateLevelBuffer(level: ReturnType<Dungeon['getLevel']>) {
    const renderedLevel = this.viewport.render(level)
    for (let y = 0; y < this.levelBuffer.height; y++) {
      for (let x = 0; x < this.levelBuffer.width; x++) {
        this.levelBuffer.set(x, y, renderedLevel[y][x])
      }
    }
  }

  private updateEntityBuffer() {
    const levelId = this.dungeon.currentLevel.id
    const origin = this.viewport.origin

    this.entityBuffer.clear()
    for (let y = 0; y < this.entityBuffer.height; y++) {
      for (let x = 0; x < this.entityBuffer.width; x++) {
        const content = this.dungeon
          .at(origin.x + x, origin.y + y, levelId)
          .at(0)
        if (!content) {
          continue
        }

        const screenPosition = this.viewport.toScreen({
          x: content.x,
          y: content.y,
        })
        if (!screenPosition) {
          continue
        }

        const char =
          content.type === 'hero' ? content.hero.char : content.monster.char
        this.entityBuffer.set(screenPosition.x, screenPosition.y, char)
      }
    }
  }
}
