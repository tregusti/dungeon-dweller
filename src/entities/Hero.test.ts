import { describe, expect, it } from '@jest/globals'

import { expectToHaveProperty } from '../test/expect.js'
import { Coords } from '../types.js'
import { Hero, MoveResult } from './Hero.js'

const expectCoords = (hero: Hero, x: number, y: number) => {
  expectToHaveProperty(hero, 'x', x)
  expectToHaveProperty(hero, 'y', y)
}

describe('Hero', () => {
  describe('movement', () => {
    function testCommonMovementBehavior(
      expectedTo: Coords,
      moveFn: (hero: Hero) => MoveResult,
    ) {
      it('should return the from and to coordinates', () => {
        const hero = new Hero({ x: 5, y: 5, levelId: '1' })
        const result = moveFn(hero)
        expect(result).toEqual({
          from: { x: 5, y: 5, levelId: '1' },
          to: { ...expectedTo, levelId: '1' },
        })
      })
      it('should increase the turn count by 1', () => {
        const hero = new Hero({ x: 5, y: 5, levelId: '1' })
        expectToHaveProperty(hero, 'turns', 0)
        moveFn(hero)
        expectToHaveProperty(hero, 'turns', 1)
      })
      it('should decrease the energy by the hero speed', () => {
        const hero = new Hero({ x: 5, y: 5, levelId: '1' })
        expectToHaveProperty(hero, 'energy', hero.speed)
        moveFn(hero)
        expectToHaveProperty(hero, 'energy', 0)
      })
    }

    describe('.moveBy', () => {
      it('should move the hero by the delta sent in', () => {
        const hero = new Hero({ x: 5, y: 5, levelId: '1' })
        hero.moveBy(1, 0)
        expectCoords(hero, 6, 5)
      })
      testCommonMovementBehavior({ x: 6, y: 5 }, (hero) => hero.moveBy(1, 0))
    })

    describe('.moveTo', () => {
      it('should move the hero to the coordinates sent in', () => {
        const hero = new Hero({ x: 5, y: 5, levelId: '1' })
        hero.moveTo(1, 2)
        expectCoords(hero, 1, 2)
      })
      testCommonMovementBehavior({ x: 1, y: 2 }, (hero) => hero.moveTo(1, 2))
    })
  })
})
