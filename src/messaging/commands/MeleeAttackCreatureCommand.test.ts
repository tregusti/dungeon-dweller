import { Debug } from '../../Debug'
import { Hero } from '../../entities/Hero'
import { Monster } from '../../entities/Monster'
import { MonsterCollection } from '../../entities/MonsterCollection'
import { EventBus } from '../core/EventBus'
import { EventPayload, Events } from '../core/Events'
import { MeleeAttackCreatureCommandHandler } from './MeleeAttackCreatureCommand'

describe('MeleeAttackCreatureCommandHandler', () => {
  const createSUT = () => {
    const monsters = new MonsterCollection()
    const events = new EventBus<Events>()
    const subject = new MeleeAttackCreatureCommandHandler(monsters, events)

    return {
      events,
      monsters,
      subject,
    }
  }

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when target is a monster', () => {
    it('kills and removes the target monster', () => {
      const { subject, monsters, events } = createSUT()
      const hero = new Hero({ x: 1, y: 1, levelId: '1' })
      const target = new Monster({ x: 2, y: 1, speed: 10, levelId: '1' })
      monsters.add(target)

      jest.spyOn(Debug, 'write').mockImplementation(() => {})
      const killedEvents: EventPayload<'MonsterKilled'>[] = []
      events.subscribe('MonsterKilled', (payload) => {
        killedEvents.push(payload)
      })

      const result = subject.handle({
        attacker: hero,
        target,
      })

      expect(result).toEqual({
        success: true,
        outcome: 'target-killed',
        attacker: hero,
        target,
      })
      expect(monsters.list()).toHaveLength(0)
      expect(hero.kills).toBe(1)
      expect(killedEvents).toEqual([
        {
          monster: target,
          at: { x: 2, y: 1 },
        },
      ])
    })
  })

  describe('when target is the hero', () => {
    it('does not remove monsters and emits debug output', () => {
      const { subject, monsters } = createSUT()
      const hero = new Hero({ x: 1, y: 1, levelId: '1' })
      const monster = new Monster({ x: 2, y: 1, speed: 10, levelId: '1' })
      monsters.add(monster)

      const debug = jest.spyOn(Debug, 'write').mockImplementation(() => {})

      const result = subject.handle({
        attacker: monster,
        target: hero,
      })

      expect(result).toEqual({
        success: true,
        outcome: 'hero-attacked',
        attacker: monster,
        target: hero,
      })
      expect(monsters.list()).toEqual([monster])
      expect(debug).toHaveBeenCalledWith(expect.stringContaining('Hero'))
    })
  })
})
