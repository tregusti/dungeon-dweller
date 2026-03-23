import { Hero } from '../../entities/Hero'
import { Monster } from '../../entities/Monster'
import { Position } from '../../types'
import { EventBus } from '../core/EventBus'
import { Events, EventType } from '../core/Events'
import { MoveCreatureCollisionService } from '../services/MoveCreatureCollisionService'

export const MoveHeroCommandType = Symbol('MoveHero')

export type MoveHeroCommandPayload = { dx: number; dy: number }
export type MoveHeroCommandResult =
  | {
      success: false
      reason: 'wall'
    }
  | {
      success: false
      reason: 'monster'
      monster: Monster
    }
  | {
      success: true
      from: Position
      to: Position
    }

export const Movement = {
  Up: { dx: 0, dy: -1 },
  Down: { dx: 0, dy: 1 },
  Left: { dx: -1, dy: 0 },
  Right: { dx: 1, dy: 0 },
} as const

export class MoveHeroCommandHandler {
  constructor(
    private readonly hero: Hero,
    private readonly collision: MoveCreatureCollisionService,
    private readonly events: EventBus<Events>,
  ) {}

  async handle({
    dx,
    dy,
  }: MoveHeroCommandPayload): Promise<MoveHeroCommandResult> {
    const evaluation = this.collision.evaluate({
      from: { x: this.hero.x, y: this.hero.y },
      dx,
      dy,
    })

    if (evaluation.success) {
      const { from, to } = this.hero.move(dx, dy)
      await this.events.publish(EventType.HeroMoved, {
        from: from,
        to: to,
        hero: this.hero,
      })
      return {
        success: true,
        from,
        to,
      }
    } else {
      if (evaluation.reason === 'monster') {
        return {
          success: false,
          reason: 'monster',
          monster: evaluation.monster,
        }
      }

      return {
        success: false,
        reason: 'wall',
      }
    }
  }
}
