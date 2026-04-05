import { Buffer } from '../buffer/Buffer.js'
import { colorize } from '../Color.js'
import { Dungeon } from '../levels/Dungeon.js'
import { Level } from '../levels/Level.js'
import { EventBus, Events } from '../messaging/core/main.js'
import { Coords, Size } from '../types.js'
import { pluck } from '../utils/object.js'
import { BaseRenderer, BaseRendererArgs } from './BaseRenderer.js'
import { Viewport } from './Viewport.js'

type DungeonRendererArgs = BaseRendererArgs & {
  eventBus: EventBus<Events>
  size: Size
  coords: Coords
  dungeon: Dungeon
  viewport: Viewport
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
    dungeon,
    viewport,
  }: DungeonRendererArgs) {
    super({ bufferCompositor, terminal })
    this.eventBus = eventBus
    this.dungeon = dungeon
    this.viewport = viewport

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
      this.renderScene(pluck(hero, ['x', 'y']))
      this.redraw()
    })
    this.eventBus.subscribe('HeroMoved', ({ hero, to }) => {
      this.renderScene(pluck(hero, ['x', 'y']))
      this.redraw()
    })
    this.eventBus.subscribe('LevelSwitched', ({ hero, to }) => {
      this.renderScene(pluck(hero, ['x', 'y']))
      this.redraw()
    })
    // this.eventBus.subscribe('MonsterCreated', ({ monster }) => {
    //   if (monster.levelId !== this.dungeon.currentLevel.id) {
    //     return
    //   }
    //   this.updateEntityBuffer()
    //   this.redraw()
    // })
    // this.eventBus.subscribe('MonsterKilled', ({ monster }) => {
    //   if (monster.levelId !== this.dungeon.currentLevel.id) {
    //     return
    //   }
    //   this.updateEntityBuffer()
    //   this.redraw()
    // })
    // this.eventBus.subscribe('MonsterMoved', ({ monster }) => {
    //   if (monster.levelId !== this.dungeon.currentLevel.id) {
    //     return
    //   }
    //   this.updateEntityBuffer()
    //   this.redraw()
    // })
  }

  private renderScene(heroCoords: Coords) {
    const level = this.dungeon.currentLevel
    this.viewport.update(heroCoords, {
      width: level.width,
      height: level.height,
    })
    this.updateLevelBuffer(level)
    this.updateEntityBuffer()
  }

  private updateLevelBuffer(level: Level) {
    const renderedLevel = this.viewport.render(level)
    for (let y = 0; y < renderedLevel.length; y++) {
      for (let x = 0; x < renderedLevel[y].length; x++) {
        this.levelBuffer.set(x, y, renderedLevel[y][x])
      }
    }
  }

  private updateEntityBuffer() {
    const levelId = this.dungeon.currentLevel.id
    const origin = this.viewport.origin

    const level = this.dungeon.currentLevel

    this.entityBuffer.clear()
    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        const content = this.dungeon
          .at(origin.x + x, origin.y + y, levelId)
          .filter((c) => ['hero', 'monster'].includes(c.type))
          .at(-1)
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

        this.entityBuffer.set(
          screenCoords.x,
          screenCoords.y,
          content.content.value,
        )
      }
    }
  }
}
