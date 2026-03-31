import { Hero } from '../../entities/Hero.js'
import { Monster } from '../../entities/Monster.js'
import { MonsterCollection } from '../../entities/MonsterCollection.js'
import { MoveCreatureCollisionService } from './MoveCreatureCollisionService.js'

describe('MoveCreatureCollisionService', () => {
  const createSUT = () => {
    const level = {
      width: 10,
      height: 10,
      isInside: (x: number, y: number) => x >= 0 && y >= 0 && x < 10 && y < 10,
    }
    const dungeon = {
      getLevel: jest.fn(() => level),
    } as any
    const hero = new Hero({ x: 8, y: 5, levelId: '1' })
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
      from: { x: 5, y: 5 },
      dx: 1,
      dy: 0,
      levelId: '1',
    })
    expect(result).toEqual({
      success: true,
    })
  })

  it('evaluate move into monster as unsuccessful and return monster', () => {
    const { subject, monsters } = createSUT()
    const monster = Monster.create('orc', { x: 6, y: 5, levelId: '1' })
    monsters.add(monster)
    const result = subject.evaluate({
      from: { x: 5, y: 5 },
      dx: 1,
      dy: 0,
      levelId: '1',
    })
    expect(result).toEqual({
      success: false,
      reason: 'monster',
      monster,
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
      reason: 'wall',
    })
  })

  it('evaluate move into hero as unsuccessful and return reason hero with hero', () => {
    const { hero, subject } = createSUT()
    const result = subject.evaluate({
      from: { x: 7, y: 5 },
      dx: 1,
      dy: 0,
      levelId: '1',
    })

    expect(result).toEqual({
      success: false,
      reason: 'hero',
      hero,
    })
  })
})
