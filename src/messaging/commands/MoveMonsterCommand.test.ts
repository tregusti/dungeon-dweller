import { assert } from 'ts-essentials'

import { Hero } from '../../entities/Hero.js'
import { Monster } from '../../entities/Monster.js'
import { MonsterCollection } from '../../entities/MonsterCollection.js'
import { Cell } from '../../types.js'
import { EventBus } from '../core/EventBus.js'
import { EventPayload, Events } from '../core/Events.js'
import { MoveCreatureCollisionService } from '../services/MoveCreatureCollisionService.js'
import { MoveMonsterCommandHandler } from './MoveMonsterCommand.js'

describe('MoveMonsterCommandHandler', () => {
  const createSUT = ({
    heroCell = { x: 5, y: 5, levelId: '1' },
    randomInts = [1, 0],
  }: {
    heroCell?: Cell
    randomInts?: number[]
  } = {}) => {
    const level = {
      width: 10,
      height: 10,
      isInside: (x: number, y: number) => x >= 0 && y >= 0 && x < 10 && y < 10,
    }
    const dungeon = {
      getLevel: jest.fn(() => level),
    } as any
    const hero = new Hero(heroCell)
    const monsters = new MonsterCollection()
    const events = new EventBus<Events>()
    const collision = new MoveCreatureCollisionService(dungeon, monsters, hero)
    const random = {
      int: jest.fn((...args: [number] | [number, number]) => {
        const next = randomInts.shift()
        if (next === undefined) {
          throw new Error(`Missing random value for int(${args.join(', ')})`)
        }
        return next
      }),
    }
    const subject = new MoveMonsterCommandHandler(
      hero,
      collision,
      random,
      events,
    )

    return {
      hero,
      monsters,
      events,
      random,
      subject,
    }
  }

  it('moves toward hero when the toward branch is selected', async () => {
    const { monsters, subject } = createSUT({
      heroCell: { x: 7, y: 5, levelId: '1' },
      randomInts: [1, 0],
    })
    const monster = Monster.create('orc', { x: 5, y: 5, levelId: '1' })
    monsters.add(monster)

    const result = await subject.handle({ monster })

    expect(result).toEqual({
      success: true,
      from: { x: 5, y: 5 },
      to: { x: 6, y: 5 },
    })
  })

  it('moves in a non-toward direction when the other branch is selected', async () => {
    const { monsters, subject } = createSUT({
      heroCell: { x: 7, y: 5, levelId: '1' },
      randomInts: [100, 0],
    })
    const monster = Monster.create('orc', { x: 5, y: 5, levelId: '1' })
    monsters.add(monster)

    const result = await subject.handle({ monster })

    expect(result).toEqual({
      success: true,
      from: { x: 5, y: 5 },
      to: { x: 5, y: 4 },
    })
  })

  it('retries when chosen direction collides with wall', async () => {
    const { monsters, subject } = createSUT({
      heroCell: { x: 2, y: 0, levelId: '1' },
      randomInts: [100, 2, 1, 0],
    })
    const monster = Monster.create('orc', { x: 0, y: 0, levelId: '1' })
    monsters.add(monster)

    const result = await subject.handle({ monster })

    expect(result).toEqual({
      success: true,
      from: { x: 0, y: 0 },
      to: { x: 1, y: 0 },
    })
  })

  it('does not move into the hero', async () => {
    const { hero, monsters, subject } = createSUT({
      heroCell: { x: 6, y: 5, levelId: '1' },
      randomInts: [1, 0],
    })
    const monster = Monster.create('orc', { x: 5, y: 5, levelId: '1' })
    monsters.add(monster)

    const result = await subject.handle({ monster })

    assert(result.success === false)
    assert(result.reason === 'hero')
    assert(result.hero === hero)
    expect(monster).toHaveProperty('x', 5)
    expect(monster).toHaveProperty('y', 5)
  })

  it('emits MonsterMoved when the monster moves', async () => {
    const { events, monsters, subject } = createSUT({
      heroCell: { x: 7, y: 5, levelId: '1' },
      randomInts: [1, 0],
    })
    const monster = Monster.create('orc', { x: 5, y: 5, levelId: '1' })
    monsters.add(monster)

    const movedEvents: EventPayload<'MonsterMoved'>[] = []
    events.subscribe('MonsterMoved', (payload) => {
      movedEvents.push(payload)
    })

    await subject.handle({ monster })

    expect(movedEvents).toHaveLength(1)
    expect(movedEvents.at(0)).toEqual(
      expect.objectContaining({
        from: { x: 5, y: 5 },
        to: { x: 6, y: 5 },
      }),
    )
    expect(movedEvents.at(0)?.monster).toBe(monster)
  })
})
