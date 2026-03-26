import { expectToBe } from '../../test/expect'
import { CreateHeroCommandHandler } from './CreateHeroCommand'

describe('CreateHeroCommandHandler', () => {
  it('should create hero in dungeon bounds using prng values', () => {
    const random = {
      int: jest
        .fn()
        .mockReturnValueOnce(2) // x
        .mockReturnValueOnce(1), // y
    }

    const subject = new CreateHeroCommandHandler(
      { width: 5, height: 4 },
      random,
      '1',
    )

    const result = subject.handle()

    expectToBe(result.success, true)
    expect(result.hero.x).toBe(2)
    expect(result.hero.y).toBe(1)
    expect(random.int).toHaveBeenNthCalledWith(1, 4)
    expect(random.int).toHaveBeenNthCalledWith(2, 3)
  })
})
