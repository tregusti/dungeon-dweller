import assert from 'assert'

import { Hero } from '../entities/Hero'
import { Monster } from '../entities/Monster'
import { MonsterCollection } from '../entities/MonsterCollection'
import { Dungeon, SpotContent } from './Dungeon'

const createSUT = ({
  heroPosition = { x: 0, y: 0 },
  size = { width: 5, height: 5 },
} = {}) => {
  const hero = new Hero(heroPosition)
  const monsters = new MonsterCollection()
  const dungeon = new Dungeon(size, hero, monsters)
  return { dungeon, hero, monsters }
}

describe('Dungeon', () => {
  it('should have a size', () => {
    const { dungeon } = createSUT({ size: { width: 4, height: 8 } })

    expect(dungeon.width).toBe(4)
    expect(dungeon.height).toBe(8)
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
      const monster = new Monster({ x: 2, y: 2, speed: 10 })
      monsters.add(monster)

      const list = dungeon.at(2, 2)
      expect(list).toHaveLength(1)
      const cell = list.at(0) as SpotContent
      assert(cell.type === 'monster')
      expect(cell.monster).toBe(monster)
    })
  })
  describe('.isOccupied() and .isFree()', () => {
    it('should return false for an empty spot', () => {
      const { dungeon } = createSUT()
      expect(dungeon.isOccupied(1, 1)).toBe(false)
      expect(dungeon.isFree(1, 1)).toBe(true)
    })
    it('should return false if hero is on the spot', () => {
      const { dungeon } = createSUT({ heroPosition: { x: 1, y: 1 } })
      expect(dungeon.isOccupied(1, 1)).toBe(true)
      expect(dungeon.isFree(1, 1)).toBe(false)
    })
    it('should return false if monster is on the spot', () => {
      const { dungeon, monsters } = createSUT()
      const monster = new Monster({ x: 2, y: 2, speed: 10 })
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
        heroPosition: DD,
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
        heroPosition: AA,
        size: { width: 2, height: 2 },
      })
      monsters.add(new Monster({ ...CC, speed: 10 }))
      monsters.add(new Monster({ ...DD, speed: 10 }))

      const result = dungeon.getFreePositions()
      expect(result).toHaveLength(1)
      expect(result).toContainEqual(BB)
    })
  })
})
