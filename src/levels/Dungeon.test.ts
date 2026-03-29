import assert from 'assert'

import { Hero } from '../entities/Hero'
import { Monster } from '../entities/Monster'
import { MonsterCollection } from '../entities/MonsterCollection'
import { Tile } from '../entities/Tile'
import { Cell, Size } from '../types'
import { Dungeon } from './Dungeon'
import { Level } from './Level'

const createSUT = ({
  heroCell = { x: 0, y: 0, levelId: '1' },
  size = { width: 5, height: 5 },
  levels = [
    new Level(
      '1',
      Array.from({ length: size.height }, () => Array(size.width).fill(' ')),
    ),
    new Level(
      '2',
      Array.from({ length: size.height }, () => Array(size.width).fill(' ')),
    ),
  ],
}: {
  heroCell?: Cell
  size?: Size
  levels?: Level[]
} = {}) => {
  const hero = new Hero(heroCell)
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
      heroCell: { x: 0, y: 0, levelId: '2' },
    })

    expect(dungeon.currentLevel.id).toBe('2')
  })

  describe('.at()', () => {
    it('should return the tile only for an unoccupied cell', () => {
      const { dungeon } = createSUT()
      const result = dungeon.at(1, 1)
      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('type', 'tile')
    })
    describe('when the cell is occupied', () => {
      it('should return the hero', () => {
        const { dungeon } = createSUT()
        const list = dungeon.at(0, 0)
        const cell = list.find((c) => c.type === 'hero')
        assert(cell)
        expect(cell.content).toBeInstanceOf(Hero)
      })
      it('should return the tile as well', () => {
        const { dungeon } = createSUT()
        const list = dungeon.at(0, 0)
        const cell = list.find((c) => c.type === 'tile')
        assert(cell)
        expect(cell.content).toBeInstanceOf(Tile)
      })
      it('should return the monster', () => {
        const { dungeon, monsters } = createSUT()
        const monster = Monster.create('orc', { x: 2, y: 2, levelId: '1' })
        monsters.add(monster)

        const list = dungeon.at(2, 2)
        const cell = list.find((c) => c.type === 'monster')
        assert(cell)
        expect(cell.content).toBe(monster)
      })

      it('should ignore occupants from other levels', () => {
        const { dungeon, monsters } = createSUT({
          heroCell: { x: 2, y: 2, levelId: '2' },
        })
        const monster = Monster.create('orc', { x: 1, y: 1, levelId: '2' })
        monsters.add(monster)

        expect(dungeon.at(2, 2, '1')).not.toContain(monster)
        expect(dungeon.at(1, 1, '1')).not.toContain(monster)
      })
    })
  })
  describe('.isOccupied() and .isFree()', () => {
    it('should return false for an empty cell', () => {
      const { dungeon } = createSUT()
      expect(dungeon.isOccupied(1, 1)).toBe(false)
      expect(dungeon.isFree(1, 1)).toBe(true)
    })
    it('should return false if hero is on the cell', () => {
      const { dungeon } = createSUT({
        heroCell: { x: 1, y: 1, levelId: '1' },
      })
      expect(dungeon.isOccupied(1, 1)).toBe(true)
      expect(dungeon.isFree(1, 1)).toBe(false)
    })
    it('should return false if monster is on the cell', () => {
      const { dungeon, monsters } = createSUT()
      const monster = Monster.create('orc', { x: 2, y: 2, levelId: '1' })
      monsters.add(monster)

      expect(dungeon.isOccupied(2, 2)).toBe(true)
      expect(dungeon.isFree(2, 2)).toBe(false)
    })
  })
  describe('.getFreeCoords()', () => {
    const AA = { x: 0, y: 0 }
    const BB = { x: 1, y: 0 }
    const CC = { x: 0, y: 1 }
    const DD = { x: 1, y: 1 }

    it('should not include hero coords', () => {
      const { dungeon } = createSUT({
        heroCell: { ...DD, levelId: '1' },
        size: { width: 2, height: 2 },
      })
      const result = dungeon.getFreeCoords()
      expect(result).toHaveLength(3)
      expect(result).toContainEqual(AA)
      expect(result).toContainEqual(BB)
      expect(result).toContainEqual(CC)
    })

    it('should not return creature coords', () => {
      const { dungeon, monsters } = createSUT({
        heroCell: { ...AA, levelId: '1' },
        size: { width: 2, height: 2 },
      })
      monsters.add(Monster.create('orc', { ...CC, levelId: '1' }))
      monsters.add(Monster.create('orc', { ...DD, levelId: '1' }))

      const result = dungeon.getFreeCoords()
      expect(result).toHaveLength(1)
      expect(result).toContainEqual(BB)
    })

    it('should only consider occupants on the requested level', () => {
      const { dungeon, monsters } = createSUT({
        heroCell: { ...AA, levelId: '2' },
        size: { width: 2, height: 2 },
      })
      monsters.add(Monster.create('orc', { ...CC, levelId: '2' }))

      const result = dungeon.getFreeCoords('1')

      expect(result).toHaveLength(4)
      expect(result).toContainEqual(AA)
      expect(result).toContainEqual(BB)
      expect(result).toContainEqual(CC)
      expect(result).toContainEqual(DD)
    })
  })
})
