import { MonsterCollection } from '../../../entities/EntityCollection'
import { Monster } from '../../../entities/Monster'
import { MoveHeroCollisionService } from './MoveHeroCollisionService'

describe('MoveHeroCollisionService', () => {
  const createSUT = () => {
    const dungeon = { width: 10, height: 10 }
    const monsters = new MonsterCollection()
    const subject = new MoveHeroCollisionService(dungeon, monsters)

    return {
      monsters,
      subject,
    }
  }

  it('should evaluate move into empty space as a successful move', () => {
    const { subject } = createSUT()
    const result = subject.evaluate({ from: { x: 5, y: 5 }, dx: 1, dy: 0 })
    expect(result).toEqual({
      success: true,
    })
  })

  it('evaluate move into monster as unsuccessful and return monster', () => {
    const { subject, monsters } = createSUT()
    const monster = new Monster({ x: 6, y: 5 })
    monsters.add(monster)
    const result = subject.evaluate({ from: { x: 5, y: 5 }, dx: 1, dy: 0 })
    expect(result).toEqual({
      success: false,
      reason: 'monster',
      monster,
    })
  })

  it('evaluate move outside dungeon as unsuccessful and return reason wall', () => {
    const { subject } = createSUT()
    const result = subject.evaluate({ from: { x: 0, y: 0 }, dx: -1, dy: 0 })
    expect(result).toEqual({
      success: false,
      reason: 'wall',
    })
  })
})
