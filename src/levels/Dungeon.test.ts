import assert from 'assert'

import { Hero } from '../entities/Hero'
import { Monster } from '../entities/Monster'
import { MonsterCollection } from '../entities/MonsterCollection'
import { Spot } from '../types'
import { Dungeon, SpotContent } from './Dungeon'
import { Level } from './Level'

const createSUT = ({
  heroPosition = { x: 0, y: 0, levelId: '1' },
  size = { width: 5, height: 5 },
  levels = [
    new Level(
      '1',
      Array.from({ length: size.height }, () => Array(size.width).fill('.')),
    ),
    new Level(
      '2',
      Array.from({ length: size.height }, () => Array(size.width).fill('.')),
    ),
  ],
}: {
  heroPosition?: Spot
  size?: { width: number; height: number }
  levels?: Level[]
} = {}) => {
  const hero = new Hero(heroPosition)
  const monsters = new MonsterCollection()
  const dungeon = new Dungeon(size, hero, monsters, levels)
  return { dungeon, hero, monsters }
}

describe('Dungeon', () => {
  it('should have a size', () => {
    const { dungeon } = createSUT({ size: { width: 4, height: 8 } })

    expect(dungeon.width).toBe(4)
    expect(dungeon.height).toBe(8)
  })

  it('should expose currentLevel from the hero level id', () => {
    const { dungeon } = createSUT({
      heroPosition: { x: 0, y: 0, levelId: '2' },
    })

    expect(dungeon.currentLevel.id).toBe('2')
  })

  describe('.at()', () => {
    it('should return empty list for an empty spot', () => {
      const { dungeon } = createSUT()
      const result = dungeon.at(1, 1)
      expect(result).toHaveLength(0)
    })

    it('should return the hero', () => {
      const { dungeon } = createSUT()
      const list = dungeon.at(0, 0)
      expect(list).toHaveLength(1)
      const cell = list.at(0) as SpotContent
      assert(cell.type === 'hero')
      expect(cell.hero).toBeInstanceOf(Hero)
    })
    it('should return the monster', () => {
      const { dungeon, monsters } = createSUT()
      const monster = new Monster({ x: 2, y: 2, speed: 10, levelId: '1' })
      monsters.add(monster)

      const list = dungeon.at(2, 2)
      expect(list).toHaveLength(1)
      const cell = list.at(0) as SpotContent
      assert(cell.type === 'monster')
      expect(cell.monster).toBe(monster)
    })

    it('should ignore occupants from other levels', () => {
      const { dungeon, monsters } = createSUT({
        heroPosition: { x: 2, y: 2, levelId: '2' },
      })
      monsters.add(new Monster({ x: 1, y: 1, speed: 10, levelId: '2' }))

      expect(dungeon.at(2, 2, '1')).toHaveLength(0)
      expect(dungeon.at(1, 1, '1')).toHaveLength(0)
    })
  })
  describe('.isOccupied() and .isFree()', () => {
    it('should return false for an empty spot', () => {
      const { dungeon } = createSUT()
      expect(dungeon.isOccupied(1, 1)).toBe(false)
      expect(dungeon.isFree(1, 1)).toBe(true)
    })
    it('should return false if hero is on the spot', () => {
      const { dungeon } = createSUT({
        heroPosition: { x: 1, y: 1, levelId: '1' },
      })
      expect(dungeon.isOccupied(1, 1)).toBe(true)
      expect(dungeon.isFree(1, 1)).toBe(false)
    })
    it('should return false if monster is on the spot', () => {
      const { dungeon, monsters } = createSUT()
      const monster = new Monster({ x: 2, y: 2, speed: 10, levelId: '1' })
      monsters.add(monster)

      expect(dungeon.isOccupied(2, 2)).toBe(true)
      expect(dungeon.isFree(2, 2)).toBe(false)
    })
  })
  describe('.getFreePositions()', () => {
    const AA = { x: 0, y: 0 }
    const BB = { x: 1, y: 0 }
    const CC = { x: 0, y: 1 }
    const DD = { x: 1, y: 1 }

    it('should not include hero position', () => {
      const { dungeon } = createSUT({
        heroPosition: { ...DD, levelId: '1' },
        size: { width: 2, height: 2 },
      })
      const result = dungeon.getFreePositions()
      expect(result).toHaveLength(3)
      expect(result).toContainEqual(AA)
      expect(result).toContainEqual(BB)
      expect(result).toContainEqual(CC)
    })

    it('should not return creature positions', () => {
      const { dungeon, monsters } = createSUT({
        heroPosition: { ...AA, levelId: '1' },
        size: { width: 2, height: 2 },
      })
      monsters.add(new Monster({ ...CC, speed: 10, levelId: '1' }))
      monsters.add(new Monster({ ...DD, speed: 10, levelId: '1' }))

      const result = dungeon.getFreePositions()
      expect(result).toHaveLength(1)
      expect(result).toContainEqual(BB)
    })

    it('should only consider occupants on the requested level', () => {
      const { dungeon, monsters } = createSUT({
        heroPosition: { ...AA, levelId: '2' },
        size: { width: 2, height: 2 },
      })
      monsters.add(new Monster({ ...CC, speed: 10, levelId: '2' }))

      const result = dungeon.getFreePositions('1')

      expect(result).toHaveLength(4)
      expect(result).toContainEqual(AA)
      expect(result).toContainEqual(BB)
      expect(result).toContainEqual(CC)
      expect(result).toContainEqual(DD)
    })
  })
})
