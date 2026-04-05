import { describe, expect, it } from '@jest/globals'

import { LevelBuilder } from '../test/LevelBuilder.js'

describe('Level', () => {
  it('should report whether coordinates are inside level bounds', () => {
    const level = LevelBuilder.create().withSize(2, 2).build()

    expect(level.isInside(0, 0)).toBe(true)
    expect(level.isInside(1, 1)).toBe(true)
    expect(level.isInside(-1, 0)).toBe(false)
    expect(level.isInside(3, 0)).toBe(false)
    expect(level.isInside(0, 2)).toBe(false)
  })

  it('should expose every coords in row-major order', () => {
    const level = LevelBuilder.create().withSize(3, 2).build()

    expect(Array.from(level.coords())).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ])
  })
})
