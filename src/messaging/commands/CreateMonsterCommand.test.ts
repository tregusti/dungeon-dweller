import { Hero } from '../../entities/Hero'
import { MonsterCollection } from '../../entities/MonsterCollection'
import { Dungeon } from '../../levels/Dungeon'
import { Level } from '../../levels/Level'
import { Random, RandomGenerator } from '../../Random'
import { expectToBe, expectToHaveProperty } from '../../test/expect'
import { Cell, Size } from '../../types'
import { EventBus, Events } from '../core'
import { CreateMonsterCommandHandler } from './CreateMonsterCommand'

describe('CreateMonsterCommandHandler', () => {
  const createSUT = ({
    dungeonSize = { width: 5, height: 5 },
    heroCell = { x: 1, y: 1, levelId: '1' },
    levelId = '1',
    random = new Random('test-seed'),
  }: {
    dungeonSize?: Size
    heroCell?: Cell
    levelId?: string
    random?: RandomGenerator
  } = {}) => {
    const monsters = new MonsterCollection()
    const hero = new Hero(heroCell)
    // TODO Add a LevelBuilder or something similar to make it easier to create
    // levels for testing.
    const level = new Level(
      levelId,
      Array.from({ length: dungeonSize.height }, () =>
        Array(dungeonSize.width).fill(' '),
      ),
    )
    const dungeon = new Dungeon(dungeonSize, hero, monsters, [level])
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
      levelId,
      monsters,
      subject,
    }
  }

  describe('when there is at least one free coords', () => {
    it('should create and add a monster', () => {
      const { subject, monsters, levelId } = createSUT()

      const result = subject.handle({ levelId })

      expect(result.success).toBe(true)
      expectToHaveProperty(result, 'monster')

      expect(monsters.list()).toHaveLength(1)
      expect(monsters.list().at(0)).toBe(result.monster)
    })

    it('should only spawn on free coords', () => {
      const { subject, dungeon, levelId } = createSUT()
      jest.spyOn(dungeon, 'getFreeCoords').mockReturnValue([{ x: 1, y: 1 }])
      const result = subject.handle({ levelId })
      expectToBe(result.success, true)
      expect(result.monster.x).toEqual(1)
      expect(result.monster.y).toEqual(1)
    })
    it('should emit the MonsterCreated event', async () => {
      const { subject, events, levelId } = createSUT({
        dungeonSize: { width: 2, height: 1 },
      })
      const listener = jest.fn()
      events.subscribe('MonsterCreated', listener)

      const result = subject.handle({ levelId })

      expectToBe(result.success, true)
      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          monster: result.monster,
          at: expect.objectContaining({
            x: result.monster.x,
            y: result.monster.y,
          }),
        }),
      )
    })
  })

  describe('when dungeon has no free coords', () => {
    it('should return dungeon-full and not create a monster', () => {
      const { subject, monsters, levelId } = createSUT({
        dungeonSize: { width: 1, height: 1 },
        heroCell: { x: 0, y: 0, levelId: '1' },
      })

      const result = subject.handle({ levelId })

      expect(result).toEqual({
        success: false,
        reason: 'dungeon-full',
      })
      expect(monsters.list()).toHaveLength(0)
    })
  })
})
