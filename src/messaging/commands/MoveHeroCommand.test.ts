import { Hero } from '../../entities/Hero'
import { Monster } from '../../entities/Monster'
import { MonsterCollection } from '../../entities/MonsterCollection'
import { Spot } from '../../types'
import { EventBus } from '../core/EventBus'
import { EventPayload, Events } from '../core/Events'
import { MoveCreatureCollisionService } from '../services/MoveCreatureCollisionService'
import { MoveHeroCommandHandler, Movement } from './MoveHeroCommand'

describe('MoveHeroCommandHandler', () => {
  const createSUT = ({
    heroPosition = { x: 5, y: 5, levelId: '1' },
  }: { heroPosition?: Spot } = {}) => {
    const dungeon = {
      getLevel: jest.fn(() => ({ width: 10, height: 10 })),
    } as any
    const hero = new Hero(heroPosition)
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
        heroPosition: { x: 5, y: 5, levelId: '1' },
      })

      subject.handle({ dx: 1, dy: 0 })

      expect(hero.x).toBe(6)
      expect(hero.y).toBe(5)
    })
    it('should emit the HeroMoved event', async () => {
      const { events, subject, hero } = createSUT({
        heroPosition: { x: 5, y: 5, levelId: '1' },
      })
      const movedEvents: EventPayload<'HeroMoved'>[] = []
      events.subscribe('HeroMoved', (payload) => {
        movedEvents.push(payload)
      })

      await subject.handle({ dx: 1, dy: 0 })

      expect(movedEvents).toHaveLength(1)
      const movedEvent = movedEvents.at(0)
      expect(movedEvent).toHaveProperty('from', { x: 5, y: 5 })
      expect(movedEvent).toHaveProperty('to', { x: 6, y: 5 })
      expect(movedEvent?.hero).toBe(hero)
    })
    it('should return success in the result', async () => {
      const { subject } = createSUT({
        heroPosition: { x: 5, y: 5, levelId: '1' },
      })

      const result = await subject.handle({ dx: 1, dy: 0 })

      expect(result).toEqual({
        success: true,
        from: { x: 5, y: 5 },
        to: { x: 6, y: 5 },
      })
    })
  })
  describe('when monster is in the way', () => {
    it('should not move the hero', async () => {
      const { hero, monsters, subject } = createSUT({
        heroPosition: { x: 5, y: 5, levelId: '1' },
      })
      const monster = new Monster({ x: 6, y: 5, speed: 10, levelId: '1' })
      monsters.add(monster)

      await subject.handle(Movement.Right)

      expect(hero.x).toBe(5)
      expect(hero.y).toBe(5)
    })
    it('should not emit the HeroMoved event', async () => {
      // Arrange
      const { monsters, events, subject } = createSUT({
        heroPosition: { x: 5, y: 5, levelId: '1' },
      })
      const monster = new Monster({ x: 6, y: 5, speed: 10, levelId: '1' })
      monsters.add(monster)

      const movedEvents: unknown[] = []
      events.subscribe('HeroMoved', (payload) => {
        movedEvents.push(payload)
      })

      // Act
      await subject.handle(Movement.Right)

      // Assert
      expect(movedEvents).toHaveLength(0)
    })
    it('should return the reason in the result', async () => {
      const { monsters, subject } = createSUT({
        heroPosition: { x: 5, y: 5, levelId: '1' },
      })
      const monster = new Monster({ x: 6, y: 5, speed: 10, levelId: '1' })
      monsters.add(monster)

      const result = await subject.handle(Movement.Right)

      expect(result).toEqual({
        success: false,
        reason: 'monster',
        monster,
      })
    })
  })
  describe('when wall is in the way', () => {
    it('should not move the hero', async () => {
      const { hero, subject } = createSUT({
        heroPosition: { x: 0, y: 0, levelId: '1' },
      })

      await subject.handle(Movement.Left)

      expect(hero.x).toBe(0)
      expect(hero.y).toBe(0)
    })
    it('should not emit the HeroMoved event', async () => {
      // Arrange
      const { events, subject } = createSUT({
        heroPosition: { x: 0, y: 0, levelId: '1' },
      })

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
      const { subject } = createSUT({
        heroPosition: { x: 0, y: 0, levelId: '1' },
      })

      const result = await subject.handle(Movement.Left)

      expect(result).toEqual({
        success: false,
        reason: 'wall',
      })
    })
  })
})
