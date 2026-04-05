import { describe, expect, it, jest } from '@jest/globals'

import { Hero } from '../../entities/Hero.js'
import { Monster } from '../../entities/Monster.js'
import { MonsterCollection } from '../../entities/MonsterCollection.js'
import { Level } from '../../levels/Level.js'
import { expectToHaveProperty } from '../../test/expect.js'
import { LevelBuilder } from '../../test/LevelBuilder.js'
import { MonsterBuilder } from '../../test/MonsterBuilder.js'
import { Coords } from '../../types.js'
import { EventBus } from '../core/EventBus.js'
import { EventPayload, Events } from '../core/Events.js'
import { MoveCreatureCollisionService } from '../services/MoveCreatureCollisionService.js'
import { MoveHeroCommandHandler, Movement } from './MoveHeroCommand.js'

describe('MoveHeroCommandHandler', () => {
  const createSUT = ({
    heroCoords = { x: 5, y: 5 },
    level = LevelBuilder.create().build(),
  }: {
    heroCoords?: Coords
    level?: Level
  } = {}) => {
    const dungeon = {
      getLevel: jest.fn(() => level),
    } as any
    const hero = new Hero({ ...heroCoords, levelId: level.id })
    const monsters = new MonsterCollection()
    const events = new EventBus<Events>()
    const collision = new MoveCreatureCollisionService(dungeon, monsters, hero)
    const subject = new MoveHeroCommandHandler(hero, collision, events)

    return {
      hero,
      monsters,
      events,
      subject,
    }
  }

  describe('when move is successful', () => {
    it('should move the hero', () => {
      const { hero, subject } = createSUT({
        heroCoords: { x: 5, y: 5 },
      })

      subject.handle({ dx: 1, dy: 0 })

      expect(hero.x).toBe(6)
      expect(hero.y).toBe(5)
    })
    it('should emit the HeroMoved event', async () => {
      const { events, subject, hero } = createSUT({
        heroCoords: { x: 5, y: 5 },
      })
      const movedEvents: EventPayload<'HeroMoved'>[] = []
      events.subscribe('HeroMoved', (payload) => {
        movedEvents.push(payload)
      })

      await subject.handle({ dx: 1, dy: 0 })

      expect(movedEvents).toHaveLength(1)
      const movedEvent = movedEvents.at(0)
      expect(movedEvent).toHaveProperty('from', {
        x: 5,
        y: 5,
        levelId: hero.levelId,
      })
      expect(movedEvent).toHaveProperty('to', {
        x: 6,
        y: 5,
        levelId: hero.levelId,
      })
      expect(movedEvent?.hero).toBe(hero)
    })
    it('should return success in the result', async () => {
      const { subject, hero } = createSUT({
        heroCoords: { x: 5, y: 5 },
      })

      const result = await subject.handle({ dx: 1, dy: 0 })

      expect(result).toEqual({
        success: true,
        from: { x: 5, y: 5, levelId: hero.levelId },
        to: { x: 6, y: 5, levelId: hero.levelId },
      })
    })
  })
  describe('when monster is in the way', () => {
    function arrange() {
      const { hero, monsters, subject, events } = createSUT({
        heroCoords: { x: 5, y: 5 },
      })
      const monster = MonsterBuilder.create().withCoords({ x: 6, y: 5 }).build()
      monsters.add(monster)
      return { hero, subject, monster, events }
    }
    it('should not move the hero', async () => {
      const { hero, subject } = arrange()

      await subject.handle(Movement.Right)

      expect(hero.x).toBe(5)
      expect(hero.y).toBe(5)
    })
    it('should not emit the HeroMoved event', async () => {
      const { events, subject } = arrange()

      const movedEvents: unknown[] = []
      events.subscribe('HeroMoved', (payload) => {
        movedEvents.push(payload)
      })

      await subject.handle(Movement.Right)

      expect(movedEvents).toHaveLength(0)
    })
    it('should return the reason in the result', async () => {
      const { subject, monster } = arrange()

      const result = await subject.handle(Movement.Right)

      expectToHaveProperty(result, 'success', false)
      expectToHaveProperty(result, 'reason', 'blocked')
      expectToHaveProperty(result, 'type', 'monster')
      expectToHaveProperty(result, 'content', monster)
    })
  })
  describe('when wall is in the way', () => {
    function arrange() {
      const level = LevelBuilder.create().withTile(1, 0, 'wall:up down').build()
      return createSUT({
        level,
        heroCoords: { x: 0, y: 0 },
      })
    }

    it('should not move the hero', async () => {
      const { hero, subject } = arrange()

      await subject.handle(Movement.Left)

      expect(hero.x).toBe(0)
      expect(hero.y).toBe(0)
    })
    it('should not emit the HeroMoved event', async () => {
      const { subject, events } = arrange()

      const movedEvents: unknown[] = []
      events.subscribe('HeroMoved', (payload) => {
        movedEvents.push(payload)
      })

      // Act
      await subject.handle(Movement.Left)

      // Assert
      expect(movedEvents).toHaveLength(0)
    })
    it('should return the reason in the result', async () => {
      const { subject } = arrange()

      const result = await subject.handle(Movement.Right)

      expect(result).toEqual({
        success: false,
        reason: 'blocked',
        type: 'tile',
        content: expect.objectContaining({
          char: '│',
          x: 1,
          y: 0,
        }),
      })
    })
  })
})
