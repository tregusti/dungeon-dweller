import { Position } from '../types'

export type ActionType = 'move' | 'noop'
export type ActionResult = Readonly<{
  from: Position
  to: Position
  type: ActionType
}>

/**
 * Annan ide:
 *
 * # Energy System i TS
 *
 * Eftersom du frågade om speed tidigare: I TypeScript kan du implementera ett
 * Action Point (AP) eller Energy system med en enkel loop:
 *
 * ```typescript
 * TypeScript
 * // Enkel princip för din spelmotor
 * while (player.energy < 12) {
 *   allEntities.forEach((ent) => {
 *     ent.energy += ent.speed
 *     if (ent.energy >= 12 && ent.isMonster) {
 *       ent.takeTurn() // Monstret agerar
 *       ent.energy -= 12
 *     }
 *   })
 *   player.energy += player.speed
 * }
 * ```
 */

export class Entity {
  x: number
  y: number
  char: string
  /**
   * IDEA: Maybe use the inverse of speed (i.e. delay between actions) instead,
   * so that higher is slower and lower is faster? then sort all entities by
   * that value to determine action order, and subtract from it each tick until
   * it reaches 0, then reset to speed and act. This would allow for more
   * interesting interactions between entities of different speeds, e.g. a very
   * fast entity could act multiple times before a slower one gets to act once.
   */
  speed: number
  ticksUntilAct: number

  constructor({
    x,
    y,
    char,
    speed,
  }: {
    char: string
    speed: number
  } & Position) {
    this.x = x
    this.y = y
    this.char = char
    this.speed = speed
    this.ticksUntilAct = this.speed
  }

  tick(): boolean {
    this.ticksUntilAct--

    if (this.ticksUntilAct <= 0) {
      this.ticksUntilAct = this.speed
      return true // ready to act
    }

    return false
  }
}
