import { Level } from './Level'

describe('Level', () => {
  const createSUT = () =>
    new Level('1', [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])

  it('should report whether coordinates are inside level bounds', () => {
    const level = createSUT()

    expect(level.isInside(0, 0)).toBe(true)
    expect(level.isInside(2, 1)).toBe(true)
    expect(level.isInside(-1, 0)).toBe(false)
    expect(level.isInside(3, 0)).toBe(false)
    expect(level.isInside(0, 2)).toBe(false)
  })

  it('should expose every position in row-major order', () => {
    const level = createSUT()

    expect(Array.from(level.positions())).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ])
  })
})
