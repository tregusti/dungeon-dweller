import { Hero } from '../../entities/Hero'
import { Position, Spot } from '../../types'
import { EventBus } from '../core/EventBus'
import { Events } from '../core/Events'

declare module '../core/Commands' {
  interface Commands {
    SwitchLevel: CommandDef<SwitchLevelCommandPayload, SwitchLevelCommandResult>
  }
}
export type SwitchLevelCommandPayload = {
  levelId: string
  to: Position
}

export type SwitchLevelCommandResult = {
  success: true
  from: Spot
  to: Spot
}

export class SwitchLevelCommandHandler {
  constructor(
    private readonly hero: Hero,
    private readonly events: EventBus<Events>,
  ) {}

  async handle({
    levelId,
    to,
  }: SwitchLevelCommandPayload): Promise<SwitchLevelCommandResult> {
    const from: Spot = {
      x: this.hero.x,
      y: this.hero.y,
      levelId: this.hero.levelId,
    }

    this.hero.x = to.x
    this.hero.y = to.y
    this.hero.levelId = levelId

    const toSpot: Spot = { x: to.x, y: to.y, levelId }

    await this.events.publish('LevelSwitched', {
      from,
      to: toSpot,
      hero: this.hero,
    })

    return { success: true, from, to: toSpot }
  }
}
