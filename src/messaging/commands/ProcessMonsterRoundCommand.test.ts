import { Hero } from '../../entities/Hero'
import { Monster } from '../../entities/Monster'
import { MonsterCollection } from '../../entities/MonsterCollection'
import { Position } from '../../types'
import { CommandBus } from '../core/CommandBus'
import { Commands } from '../core/Commands'
import { ProcessMonsterRoundCommandHandler } from './ProcessMonsterRoundCommand'

describe('ProcessMonsterRoundCommandHandler', () => {
  const createSUT = () => {
    const hero = new Hero({ x: 0, y: 0 })
    const monsters = new MonsterCollection()
    const commandBus = new CommandBus<Commands>()

    const moveMonster = jest.fn(
      ({
        monster,
      }: {
        monster: Monster
      }): Commands['MoveMonster']['result'] => {
        const from: Position = { x: monster.x, y: monster.y }
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
    const fastMonster = new Monster({ x: 1, y: 1, speed: 25 })
    const normalMonster = new Monster({ x: 2, y: 2, speed: 12 })

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
    monsters.add(new Monster({ x: 1, y: 1, speed: 5 }))

    const result = await subject.handle()

    expect(moveMonster).not.toHaveBeenCalled()
    expect(result.actions).toHaveLength(0)
  })
})
