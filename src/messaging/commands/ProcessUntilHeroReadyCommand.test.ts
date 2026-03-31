import { Hero } from '../../entities/Hero.js'
import { CommandBus } from '../core/CommandBus.js'
import { Commands } from '../core/Commands.js'
import { ProcessUntilHeroReadyCommandHandler } from './ProcessUntilHeroReadyCommand.js'

describe('ProcessUntilHeroReadyCommandHandler', () => {
  const createSUT = () => {
    const hero = new Hero({ x: 3, y: 3, levelId: '1' })
    const commandBus = new CommandBus<Commands>()

    const processMonsterRound = jest.fn(
      (): Commands['ProcessMonsterRound']['result'] => ({
        actions: [],
      }),
    )

    commandBus.register('ProcessMonsterRound', processMonsterRound)

    const subject = new ProcessUntilHeroReadyCommandHandler(hero, commandBus)

    return {
      hero,
      processMonsterRound,
      subject,
    }
  }

  it('processes at least one monster round', async () => {
    const { hero, processMonsterRound, subject } = createSUT()
    hero.giveEnergy()

    const result = await subject.handle()

    expect(processMonsterRound).toHaveBeenCalledTimes(1)
    expect(result.rounds).toHaveLength(1)
  })

  it('repeats rounds until the hero has enough energy', async () => {
    const { hero, processMonsterRound, subject } = createSUT()

    hero.move(1, 0)
    hero.move(1, 0)

    await subject.handle()

    expect(hero.energy).toBe(hero.speed)
    expect(processMonsterRound).toHaveBeenCalledTimes(2)
  })
})
