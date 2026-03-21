import { Hero } from '../../../entities/Hero'
import { Monster } from '../../../entities/Monster'
import { RandomGenerator } from '../../../Random'
import { EventBus } from '../../core/EventBus'
import { Events, EventType } from '../../core/Events'
import { MoveCreatureCollisionService } from '../../services/MoveCreatureCollisionService'
import type {
  MoveMonsterCommandPayload,
  MoveMonsterCommandResult,
} from './MoveMonsterCommand'

type Direction = { dx: number; dy: number }

const CardinalDirections = [
  { dx: 0, dy: -1 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
  { dx: 1, dy: 0 },
] as const

export class MoveMonsterCommandHandler {
  constructor(
    private readonly hero: Hero,
    private readonly collision: MoveCreatureCollisionService,
    private readonly random: RandomGenerator,
    private readonly events: EventBus<Events>,
  ) {}

  async handle({
    monster,
  }: MoveMonsterCommandPayload): Promise<MoveMonsterCommandResult> {
    while (true) {
      const direction = this.chooseDirection(monster)
      const evaluation = this.collision.evaluate({
        from: { x: monster.x, y: monster.y },
        dx: direction.dx,
        dy: direction.dy,
      })

      if (evaluation.success) {
        const { from, to } = monster.move(direction.dx, direction.dy)
        await this.events.publish(EventType.MonsterMoved, {
          from,
          to,
          monster,
        })
        return {
          success: true,
          from,
          to,
        }
      }

      if (evaluation.reason === 'wall') {
        continue
      }

      if (evaluation.reason === 'monster') {
        return {
          success: false,
          reason: 'monster',
          monster: evaluation.monster,
        }
      }

      return {
        success: false,
        reason: 'hero',
        hero: evaluation.hero,
      }
    }
  }

  private chooseDirection(monster: Monster): Direction {
    const towardDirections = this.getTowardHeroDirections(monster)
    const shouldMoveTowardHero =
      towardDirections.length > 0 && this.random.int(1, 100) <= 50

    if (shouldMoveTowardHero) {
      return towardDirections[this.random.int(towardDirections.length - 1)]
    }

    const otherDirections = CardinalDirections.filter(
      (direction) =>
        !towardDirections.some(
          (toward) => toward.dx === direction.dx && toward.dy === direction.dy,
        ),
    )

    const candidates =
      otherDirections.length > 0 ? otherDirections : towardDirections

    return candidates[this.random.int(candidates.length - 1)]
  }

  private getTowardHeroDirections(monster: Monster): Direction[] {
    const dx = Math.sign(this.hero.x - monster.x)
    const dy = Math.sign(this.hero.y - monster.y)
    const directions: Direction[] = []

    if (dx !== 0) {
      directions.push({ dx, dy: 0 })
    }
    if (dy !== 0) {
      directions.push({ dx: 0, dy })
    }

    return directions
  }
}
