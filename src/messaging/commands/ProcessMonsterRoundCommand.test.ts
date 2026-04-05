import { describe, expect, it, jest } from '@jest/globals'

import { Hero } from '../../entities/Hero.js'
import { Monster } from '../../entities/Monster.js'
import { MonsterCollection } from '../../entities/MonsterCollection.js'
import { MonsterBuilder } from '../../test/MonsterBuilder.js'
import { Coords } from '../../types.js'
import { CommandBus } from '../core/CommandBus.js'
import { Commands } from '../core/Commands.js'
import { ProcessMonsterRoundCommandHandler } from './ProcessMonsterRoundCommand.js'

describe('ProcessMonsterRoundCommandHandler', () => {
  const createSUT = () => {
    const hero = new Hero({ x: 0, y: 0, levelId: '1' })
    const monsters = new MonsterCollection()
    const commandBus = new CommandBus<Commands>()

    const moveMonster = jest.fn(
      ({
        monster,
      }: {
        monster: Monster
      }): Commands['MoveMonster']['result'] => {
        const from: Coords = { x: monster.x, y: monster.y }
        const to = monster.move(0, 0).to

        return {
          success: true,
          from,
          to,
        }
      },
    )

    commandBus.register('MoveMonster', moveMonster)

    const subject = new ProcessMonsterRoundCommandHandler(
      monsters,
      hero,
      commandBus,
    )

    return {
      hero,
      monsters,
      moveMonster,
      subject,
    }
  }

  it('processes monsters until they can no longer act', async () => {
    const { monsters, moveMonster, subject } = createSUT()
    const fastMonster = MonsterBuilder.create().withSpeed(25).build()
    const normalMonster = MonsterBuilder.create().withSpeed(12).build()

    monsters.add(normalMonster)
    monsters.add(fastMonster)

    const result = await subject.handle()

    expect(moveMonster).toHaveBeenCalledTimes(3)
    expect(result.actions).toHaveLength(3)
    expect(result.actions.map((action) => action.monster)).toEqual([
      normalMonster,
      fastMonster,
      fastMonster,
    ])
  })

  it('skips monsters that do not have enough energy to act', async () => {
    const { monsters, moveMonster, subject } = createSUT()
    const monster = MonsterBuilder.create().withSpeed(5).build()
    monsters.add(monster)

    const result = await subject.handle()

    expect(moveMonster).not.toHaveBeenCalled()
    expect(result.actions).toHaveLength(0)
  })
})
