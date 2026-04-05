import { describe, expect, it, jest } from '@jest/globals'

import { Hero } from '../../entities/Hero.js'
import { Monster } from '../../entities/Monster.js'
import { MonsterCollection } from '../../entities/MonsterCollection.js'
import { Level } from '../../levels/Level.js'
import { expectToHaveProperty } from '../../test/expect.js'
import { MoveCreatureCollisionService } from './MoveCreatureCollisionService.js'

describe('MoveCreatureCollisionService', () => {
  const defaultLayout = Array(5).fill('·····').join('\n')

  const createSUT = ({
    levelLayout = defaultLayout,
    heroCoords = { x: 0, y: 0 },
  } = {}) => {
    const level = Level.fromLayout('1', levelLayout)
    const dungeon = {
      getLevel: jest.fn(() => level),
    } as any
    const hero = new Hero({
      x: heroCoords.x,
      y: heroCoords.y,
      levelId: level.id,
    })
    const monsters = new MonsterCollection()
    const subject = new MoveCreatureCollisionService(dungeon, monsters, hero)

    return {
      hero,
      monsters,
      subject,
    }
  }

  it('should evaluate move into empty space as a successful move', () => {
    const { subject } = createSUT()
    const result = subject.evaluate({
      from: { x: 1, y: 1 },
      dx: 1,
      dy: 0,
      levelId: '1',
    })
    expect(result).toEqual({
      success: true,
    })
  })

  it('evaluate move outside dungeon as unsuccessful and return reason wall', () => {
    const { subject } = createSUT()
    const result = subject.evaluate({
      from: { x: 0, y: 0 },
      dx: -1,
      dy: 0,
      levelId: '1',
    })
    expect(result).toEqual({
      success: false,
      reason: 'outside',
    })
  })

  describe('when blocked', () => {
    it('evaluate move into a rock as unsuccessful', () => {
      const levelLayout = `· \n··`
      const { subject } = createSUT({ levelLayout })
      const result = subject.evaluate({
        from: { x: 0, y: 0 },
        dx: 1,
        dy: 0,
        levelId: '1',
      })
      expectToHaveProperty(result, 'success', false)
      expectToHaveProperty(result, 'reason', 'blocked')
      expectToHaveProperty(result, 'type', 'tile')
      expectToHaveProperty(result, 'content.type', 'rock')
    })
    it('evaluate move into monster as unsuccessful', () => {
      const { subject, monsters } = createSUT()
      const monster = Monster.create('orc', { x: 2, y: 1, levelId: '1' })
      monsters.add(monster)
      const result = subject.evaluate({
        from: { x: 1, y: 1 },
        dx: 1,
        dy: 0,
        levelId: '1',
      })
      expectToHaveProperty(result, 'success', false)
      expectToHaveProperty(result, 'reason', 'blocked')
      expectToHaveProperty(result, 'type', 'monster')
      expect(result.content).toBe(monster)
    })
    it('evaluate move into hero as unsuccessful', () => {
      const { hero, subject } = createSUT({ heroCoords: { x: 1, y: 1 } })
      const result = subject.evaluate({
        from: { x: 1, y: 2 },
        dx: 0,
        dy: -1,
        levelId: '1',
      })

      expectToHaveProperty(result, 'success', false)
      expectToHaveProperty(result, 'reason', 'blocked')
      expectToHaveProperty(result, 'type', 'hero')
      expect(result.content).toBe(hero)
    })
  })
})
