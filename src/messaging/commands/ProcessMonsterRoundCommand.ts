import { Hero } from '../../entities/Hero'
import { Monster } from '../../entities/Monster'
import { MonsterCollection } from '../../entities/MonsterCollection'
import { CommandBus } from '../core/CommandBus'
import type { CommandDef, Commands } from '../core/Commands'
import { MoveMonsterCommandResult } from './MoveMonsterCommand'

declare module '../core/Commands' {
  interface Commands {
    ProcessMonsterRound: CommandDef<
      ProcessMonsterRoundCommandPayload,
      ProcessMonsterRoundCommandResult
    >
  }
}

export type ProcessMonsterRoundCommandPayload = void

export type ProcessMonsterRoundAction = {
  monster: Monster
  result: MoveMonsterCommandResult
}

export type ProcessMonsterRoundCommandResult = {
  actions: ProcessMonsterRoundAction[]
}

export class ProcessMonsterRoundCommandHandler {
  constructor(
    private readonly monsters: MonsterCollection,
    private readonly hero: Hero,
    private readonly commandBus: CommandBus<Commands>,
  ) {}

  async handle(): Promise<ProcessMonsterRoundCommandResult> {
    const queue = this.monsters.list({ sortBy: 'energy' })
    queue.forEach((monster) => monster.giveEnergy())

    const actions: ProcessMonsterRoundCommandResult['actions'] = []

    let monster = queue.shift()
    while (monster) {
      if (monster.energy >= this.hero.speed) {
        const result = await this.commandBus.execute('MoveMonster', {
          monster,
        })

        actions.push({
          monster,
          result,
        })

        if (monster.energy >= this.hero.speed) {
          queue.push(monster)
        }
      }

      monster = queue.shift()
    }

    return {
      actions,
    }
  }
}
