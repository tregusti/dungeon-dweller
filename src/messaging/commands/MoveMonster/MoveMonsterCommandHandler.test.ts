import { assert } from 'ts-essentials'

import { Hero } from '../../../entities/Hero'
import { Monster } from '../../../entities/Monster'
import { MonsterCollection } from '../../../entities/MonsterCollection'
import { EventBus } from '../../core/EventBus'
import { EventPayload, Events, EventType } from '../../core/Events'
import { MoveCreatureCollisionService } from '../../services/MoveCreatureCollisionService'
import { MoveMonsterCommandHandler } from './MoveMonsterCommandHandler'

describe('MoveMonsterCommandHandler', () => {
  const createSUT = ({
    heroPosition = { x: 5, y: 5 },
    randomInts = [1, 0],
  }: {
    heroPosition?: { x: number; y: number }
    randomInts?: number[]
  } = {}) => {
    const dungeon = { width: 10, height: 10 }
    const hero = new Hero(heroPosition)
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
      heroPosition: { x: 7, y: 5 },
      randomInts: [1, 0],
    })
    const monster = new Monster({ x: 5, y: 5, speed: 10 })
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
      heroPosition: { x: 7, y: 5 },
      randomInts: [100, 0],
    })
    const monster = new Monster({ x: 5, y: 5, speed: 10 })
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
      heroPosition: { x: 2, y: 0 },
      randomInts: [100, 2, 1, 0],
    })
    const monster = new Monster({ x: 0, y: 0, speed: 10 })
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
      heroPosition: { x: 6, y: 5 },
      randomInts: [1, 0],
    })
    const monster = new Monster({ x: 5, y: 5, speed: 10 })
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
      heroPosition: { x: 7, y: 5 },
      randomInts: [1, 0],
    })
    const monster = new Monster({ x: 5, y: 5, speed: 10 })
    monsters.add(monster)

    const movedEvents: EventPayload<typeof EventType.MonsterMoved>[] = []
    events.subscribe(EventType.MonsterMoved, (payload) => {
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
