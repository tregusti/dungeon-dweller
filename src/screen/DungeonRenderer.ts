import { Buffer } from '../buffer/Buffer'
import { BufferCompositor } from '../buffer/BufferCompositor'
import { colorize } from '../Color'
import { Dungeon } from '../levels/Dungeon'
import { EventBus, Events } from '../messaging/core'
import { Coords, Size } from '../types'
import { BaseRenderer } from './BaseRenderer'
import { Terminal } from './Terminal'
import { Viewport } from './Viewport'

type DungeonRendererArgs = {
  bufferCompositor: BufferCompositor
  terminal: Terminal
  eventBus: EventBus<Events>
  size: Size
  coords: Coords
  scrollMargin: Coords
  dungeon: Dungeon
}

export class DungeonRenderer extends BaseRenderer {
  private readonly levelBuffer: Buffer
  private readonly entityBuffer: Buffer
  private readonly eventBus: EventBus<Events>
  private readonly dungeon: Dungeon
  private readonly viewport: Viewport
  private heroCoords: Coords | null = null

  constructor({
    bufferCompositor,
    terminal,
    eventBus,
    size,
    coords,
    scrollMargin,
    dungeon,
  }: DungeonRendererArgs) {
    super({ bufferCompositor, terminal })
    this.eventBus = eventBus
    this.dungeon = dungeon
    this.viewport = new Viewport(size.width, size.height, scrollMargin)

    this.levelBuffer = bufferCompositor.add({
      buffer: new Buffer(size),
      x: coords.x,
      y: coords.y,
      layer: 0,
    })
    this.levelBuffer.clear()

    this.entityBuffer = bufferCompositor.add({
      buffer: new Buffer(size),
      x: coords.x,
      y: coords.y,
      layer: 1,
    })
    this.entityBuffer.clear()
  }

  attach() {
    this.eventBus.subscribe('GameInitialized', ({ hero }) => {
      this.heroCoords = { x: hero.x, y: hero.y }
      this.renderScene()
      this.redraw()
    })
    this.eventBus.subscribe('HeroMoved', ({ hero, to }) => {
      this.heroCoords = { x: to.x, y: to.y }
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
      this.heroCoords = { x: to.x, y: to.y }
      this.renderScene()
      this.redraw()
    })
  }

  private renderScene() {
    if (!this.heroCoords) {
      return
    }

    const level = this.dungeon.currentLevel
    this.viewport.update(this.heroCoords, {
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

        const screenCoords = this.viewport.toScreen({
          x: content.x,
          y: content.y,
        })
        if (!screenCoords) {
          continue
        }

        const creature =
          content.type === 'hero' ? content.hero : content.monster
        this.entityBuffer.set(
          screenCoords.x,
          screenCoords.y,
          colorize(creature.char, creature.color),
        )
      }
    }
  }
}
