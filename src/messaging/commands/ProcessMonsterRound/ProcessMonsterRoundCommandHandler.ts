import { Hero } from '../../../entities/Hero'
import { MonsterCollection } from '../../../entities/MonsterCollection'
import { CommandBus } from '../../core/CommandBus'
import { Commands, CommandType } from '../../core/Commands'
import { ProcessMonsterRoundCommandResult } from './ProcessMonsterRoundCommand'

export class ProcessMonsterRoundCommandHandler {
  constructor(
    private readonly monsters: MonsterCollection,
    private readonly hero: Hero,
    private readonly commandBus: CommandBus<Commands>,
  ) {}

  async handle(): Promise<ProcessMonsterRoundCommandResult> {
    const queue = this.monsters.all.slice()
    queue.forEach((monster) => monster.giveEnergy())

    const actions: ProcessMonsterRoundCommandResult['actions'] = []

    let monster = queue.shift()
    while (monster) {
      if (monster.energy >= this.hero.speed) {
        const result = await this.commandBus.execute(CommandType.MoveMonster, {
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
