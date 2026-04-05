import { Hero } from '../../entities/Hero.js'
import { Monster } from '../../entities/Monster.js'
import { TypeContentType } from '../../levels/Dungeon.js'
import { Coords } from '../../types.js'
import type { CommandDef } from '../core/Commands.js'
import { EventBus } from '../core/EventBus.js'
import { Events } from '../core/Events.js'
import { MoveCreatureCollisionService } from '../services/MoveCreatureCollisionService.js'

declare module '../core/Commands.js' {
  interface Commands {
    MoveHero: CommandDef<MoveHeroCommandPayload, MoveHeroCommandResult>
  }
}

export type MoveHeroCommandPayload = { dx: number; dy: number }
export type MoveHeroCommandResult =
  | {
      success: true
      from: Coords
      to: Coords
    }
  | {
      success: false
      reason: 'outside'
    }
  | (TypeContentType & {
      success: false
      reason: 'blocked'
    })

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
      levelId: this.hero.levelId,
    })

    if (evaluation.success) {
      const { from, to } = this.hero.moveBy(dx, dy)
      await this.events.publish('HeroMoved', {
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
      if (evaluation.reason === 'blocked') {
        if (evaluation.type === 'monster' || evaluation.type === 'tile') {
          return evaluation
        }
        throw new Error('Hero should not be blocked by another hero')
      }
      // outside
      return {
        success: false,
        reason: 'outside',
      }
    }
  }
}
