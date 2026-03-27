import { Hero } from '../../entities/Hero'
import { Cell, Coords } from '../../types'
import { EventBus } from '../core/EventBus'
import { Events } from '../core/Events'

declare module '../core/Commands' {
  interface Commands {
    SwitchLevel: CommandDef<SwitchLevelCommandPayload, SwitchLevelCommandResult>
  }
}
export type SwitchLevelCommandPayload = {
  levelId: string
  to: Coords
}

export type SwitchLevelCommandResult = {
  success: true
  from: Cell
  to: Cell
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
    const from: Cell = {
      x: this.hero.x,
      y: this.hero.y,
      levelId: this.hero.levelId,
    }

    this.hero.x = to.x
    this.hero.y = to.y
    this.hero.levelId = levelId

    const toCell: Cell = { x: to.x, y: to.y, levelId }

    await this.events.publish('LevelSwitched', {
      from,
      to: toCell,
      hero: this.hero,
    })

    return { success: true, from, to: toCell }
  }
}
