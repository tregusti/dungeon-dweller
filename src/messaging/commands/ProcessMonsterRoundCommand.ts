import { Hero } from '../../entities/Hero.js'
import { Monster } from '../../entities/Monster.js'
import { MonsterCollection } from '../../entities/MonsterCollection.js'
import { CommandBus } from '../core/CommandBus.js'
import type { CommandDef, Commands } from '../core/Commands.js'
import { MoveMonsterCommandResult } from './MoveMonsterCommand.js'

declare module '../core/Commands.js' {
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
    const queue = this.monsters.list({
      levelId: this.hero.levelId,
      sortBy: 'energy',
    })
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
