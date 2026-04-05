import { describe, expect, it, jest } from '@jest/globals'

import { BufferEntry } from '../buffer/Buffer.js'
import { BufferCompositor } from '../buffer/BufferCompositor.js'
import { colorize } from '../Color.js'
import { Hero } from '../entities/Hero.js'
import { Monster } from '../entities/Monster.js'
import { MonsterCollection } from '../entities/MonsterCollection.js'
import { Tile, TileDefinitions } from '../entities/Tile.js'
import { Layout } from '../Layout.js'
import { Dungeon } from '../levels/Dungeon.js'
import { Level } from '../levels/Level.js'
import { EventBus, Events } from '../messaging/core/main.js'
import { LevelBuilder } from '../test/LevelBuilder.js'
import { Coords, Size } from '../types.js'
import { DungeonRenderer } from './DungeonRenderer.js'
import { Viewport } from './Viewport.js'

class TileBuilder {
  private type: string = 'floor'
  private x: number = 0
  private y: number = 0
  private levelId: string = '1'

  static create() {
    return new TileBuilder()
  }

  withType(type: string) {
    this.type = type
    return this
  }
  withCoords(coords: Coords) {
    this.x = coords.x
    this.y = coords.y
    return this
  }
  withLevelId(levelId: string) {
    this.levelId = levelId
    return this
  }

  build() {
    const def = TileDefinitions.find((def) => def.type === this.type)
    if (!def) {
      throw new Error(
        `TileBuilder could not fint definition for tilte type: ${this.type}`,
      )
    }
    return new Tile({ x: this.x, y: this.y, levelId: this.levelId }, def)
  }
}

describe('DungeonRenderer', () => {
  const createSUT = ({
    heroCoords = { x: 0, y: 0 },
    gameSize = Layout.game.size,
    level = LevelBuilder.create().build(),
  }: { heroCoords?: Coords; gameSize?: Size; level?: Level } = {}) => {
    const hero = new Hero({ ...heroCoords, levelId: '1' })
    const viewport = new Viewport(
      gameSize.width,
      gameSize.height,
      Layout.dungeon.scrollMargin,
    )
    const bufferCompositor = new BufferCompositor(gameSize)
    const terminal = {
      clear: jest.fn(),
      writeAt: jest.fn(),
    }
    const eventBus = new EventBus<Events>()
    const coords = { x: 0, y: 0 }
    const monsters = new MonsterCollection()
    const dungeon = new Dungeon(hero, monsters, [level])

    const subject = new DungeonRenderer({
      bufferCompositor,
      terminal,
      eventBus,
      size: gameSize,
      coords,
      dungeon,
      viewport,
    })

    return {
      bufferCompositor,
      hero,
      terminal,
      eventBus,
      monsters,
      coords,
      dungeon,
      viewport,
      subject,
      level,
    }
  }
  const events = ['GameInitialized', 'HeroMoved', 'LevelSwitched'] as const
  events.forEach((eventName) => {
    describe(`when ${eventName} is invoked`, () => {
      it('should update the viewport origin', async () => {
        const { subject, eventBus, hero, viewport } = createSUT({
          heroCoords: { x: 5, y: 5 },
          level: LevelBuilder.create()
            .withSize({ width: 6, height: 6 })
            .build(),
        })
        jest.spyOn(viewport, 'update')
        subject.attach()

        eventBus.publish(eventName, { hero })

        expect(viewport.update).toHaveBeenCalledWith(
          { x: 5, y: 5 },
          { width: 6, height: 6 },
        )
      })
      it('should render the level to the terminal', async () => {
        const { subject, eventBus, hero, terminal } = createSUT({
          heroCoords: { x: 0, y: 0 },
          level: LevelBuilder.create().withLayout('··\n~+').build(),
        })
        subject.attach()

        await eventBus.publish(eventName, { hero })

        const water = TileBuilder.create().withType('water').build()
        const door = TileBuilder.create().withType('door:closed').build()
        expect(terminal.writeAt).toHaveBeenCalledWith(0, 1, water.value)
        expect(terminal.writeAt).toHaveBeenCalledWith(1, 1, door.value)
      })
      it('should render the hero to the terminal', async () => {
        const { subject, eventBus, hero, terminal } = createSUT({
          heroCoords: { x: 5, y: 5 },
        })
        subject.attach()

        await eventBus.publish(eventName, { hero })

        expect(terminal.writeAt).toHaveBeenCalledWith(5, 5, hero.value)
      })
      it('should render a monster to the terminal', async () => {
        const { subject, eventBus, hero, monsters, level, terminal } =
          createSUT()
        const monster = Monster.create('elf', { x: 1, y: 0, levelId: level.id })
        monsters.add(monster)
        subject.attach()

        await eventBus.publish(eventName, { hero })

        expect(terminal.writeAt).toHaveBeenCalledWith(1, 0, monster.value)
      })
    })
  })
})
