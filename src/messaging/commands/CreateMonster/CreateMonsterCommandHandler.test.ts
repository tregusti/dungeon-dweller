import { Hero } from '../../../entities/Hero'
import { MonsterCollection } from '../../../entities/MonsterCollection'
import { Dungeon } from '../../../levels/Dungeon'
import { Random, RandomGenerator } from '../../../Random'
import { expectToBe, expectToHaveProperty } from '../../../test/expect'
import { Position, Size } from '../../../types'
import { EventBus, Events, EventType } from '../../core'
import { CreateMonsterCommandHandler } from './CreateMonsterCommandHandler'

describe('CreateMonsterCommandHandler', () => {
  const createSUT = ({
    dungeonSize = { width: 5, height: 5 },
    heroPosition = { x: 1, y: 1 },
    random = new Random('test-seed'),
  }: {
    dungeonSize?: Size
    heroPosition?: Position
    random?: RandomGenerator
  } = {}) => {
    const hero = new Hero(heroPosition)
    const monsters = new MonsterCollection()
    const dungeon = new Dungeon(dungeonSize, hero, monsters)
    const events = new EventBus<Events>()
    const subject = new CreateMonsterCommandHandler(
      dungeon,
      monsters,
      random,
      events,
    )

    return {
      dungeon,
      events,
      hero,
      monsters,
      subject,
    }
  }

  describe('when there is at least one free position', () => {
    it('should create and add a monster', () => {
      const { subject, monsters } = createSUT()

      const result = subject.handle()

      expect(result.success).toBe(true)
      expectToHaveProperty(result, 'monster')

      expect(monsters.all()).toHaveLength(1)
      expect(monsters.all().at(0)).toBe(result.monster)
    })

    it('should only spawn on free positions', () => {
      const { subject, dungeon } = createSUT({
        heroPosition: { x: 0, y: 0 },
      })
      jest.spyOn(dungeon, 'getFreePositions').mockReturnValue([{ x: 1, y: 1 }])
      const result = subject.handle()
      expectToBe(result.success, true)
      expect(result.monster.x).toEqual(1)
      expect(result.monster.y).toEqual(1)
    })
    it('should emit the MonsterCreated event', async () => {
      const { subject, events } = createSUT({
        dungeonSize: { width: 2, height: 1 },
        heroPosition: { x: 0, y: 0 },
      })
      const promise = new Promise<void>((resolve) => {
        events.subscribe(EventType.MonsterCreated, (payload) => {
          expectToHaveProperty(payload, 'monster')
          expectToHaveProperty(payload, 'at')
          expect(payload.at).toEqual({ x: 1, y: 0 })
          resolve()
        })
      })

      subject.handle()

      await promise
    })
  })

  describe('when dungeon has no free position', () => {
    it('should return dungeon-full and not create a monster', () => {
      const { subject, monsters } = createSUT({
        dungeonSize: { width: 1, height: 1 },
        heroPosition: { x: 0, y: 0 },
      })

      const result = subject.handle()

      expect(result).toEqual({
        success: false,
        reason: 'dungeon-full',
      })
      expect(monsters.all()).toHaveLength(0)
    })
  })
})
