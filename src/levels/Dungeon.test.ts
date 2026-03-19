import assert from 'assert'

import { MonsterCollection } from '../entities/EntityCollection'
import { Hero } from '../entities/Hero'
import { Monster } from '../entities/Monster'
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
      const monster = new Monster({ x: 2, y: 2 })
      monsters.add(monster)

      const list = dungeon.at(2, 2)
      expect(list).toHaveLength(1)
      const cell = list.at(0) as SpotContent
      assert(cell.type === 'monster')
      expect(cell.monster).toBe(monster)
    })
  })
})
