import { describe, expect, it, jest } from '@jest/globals'

import { Hero } from '../../entities/Hero.js'
import { MonsterCollection } from '../../entities/MonsterCollection.js'
import { Dungeon } from '../../levels/Dungeon.js'
import { Random, RandomGenerator } from '../../Random.js'
import { expectToBe, expectToHaveProperty } from '../../test/expect.js'
import { LevelBuilder } from '../../test/LevelBuilder.js'
import { Cell, Size } from '../../types.js'
import { EventBus } from '../core/main.js'
import type { EventHandler, Events } from '../core/main.js'
import { CreateMonsterCommandHandler } from './CreateMonsterCommand.js'

describe('CreateMonsterCommandHandler', () => {
  const createSUT = ({
    levelSize = { width: 5, height: 5 },
    levelId = '1',
    heroCell = { x: 1, y: 1, levelId: '1' },
    random = new Random('test-seed'),
  }: {
    levelSize?: Size
    levelId?: string
    heroCell?: Cell
    random?: RandomGenerator
  } = {}) => {
    const monsters = new MonsterCollection()
    const hero = new Hero(heroCell)
    const level = LevelBuilder.create()
      .withSize(levelSize)
      .withId(levelId)
      .build()
    const dungeon = new Dungeon(hero, monsters, [level])
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
        levelSize: { width: 2, height: 1 },
      })
      const listener = jest.fn<EventHandler<'MonsterCreated'>>()
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
        levelSize: { width: 1, height: 1 },
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
