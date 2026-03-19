import { MonsterCollection } from '../../../entities/EntityCollection'
import { Hero } from '../../../entities/Hero'
import { Dungeon } from '../../../levels/Dungeon'
import { Random } from '../../../Random'
import { expectToBe, expectToHaveProperty } from '../../../test/expect'
import { Position, Size } from '../../../types'
import { CreateMonsterCommandHandler } from './CreateMonsterCommandHandler'

describe('CreateMonsterCommandHandler', () => {
  const createSUT = ({
    dungeonSize = { width: 5, height: 5 },
    heroPosition = { x: 1, y: 1 },
    random = Random,
  }: {
    dungeonSize?: Size
    heroPosition?: Position
    random?: Random
  } = {}) => {
    const hero = new Hero(heroPosition)
    const monsters = new MonsterCollection()
    const dungeon = new Dungeon(dungeonSize, hero, monsters)
    const subject = new CreateMonsterCommandHandler(dungeon, monsters, random)

    return {
      dungeon,
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

      expect(monsters.all).toHaveLength(1)
      expect(monsters.all.at(0)).toBe(result.monster)
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
      expect(monsters.all).toHaveLength(0)
    })
  })
})
