import { Debug } from '../../Debug'
import { Creature } from '../../entities/Creature'
import { Hero } from '../../entities/Hero'
import { Monster } from '../../entities/Monster'
import { MonsterCollection } from '../../entities/MonsterCollection'
import type { CommandDef } from '../core/Commands'
import { EventBus } from '../core/EventBus'
import { Events } from '../core/Events'

declare module '../core/Commands' {
  interface Commands {
    MeleeAttackCreature: CommandDef<
      MeleeAttackCreatureCommandPayload,
      MeleeAttackCreatureCommandResult
    >
  }
}

export type MeleeAttackCreatureCommandPayload = {
  attacker: Creature
  target: Creature
}

export type MeleeAttackCreatureCommandResult =
  | {
      success: true
      outcome: 'target-killed'
      attacker: Creature
      target: Monster
    }
  | {
      success: true
      outcome: 'hero-attacked'
      attacker: Creature
      target: Hero
    }

export class MeleeAttackCreatureCommandHandler {
  constructor(
    private readonly monsters: MonsterCollection,
    private readonly events: EventBus<Events>,
  ) {}

  handle({
    attacker,
    target,
  }: MeleeAttackCreatureCommandPayload): MeleeAttackCreatureCommandResult {
    const fakeAttackScore = attacker.speed + 3
    const fakeDefenseScore = target.speed + 1
    Debug.write(
      `Fake melee compare: attacker=${fakeAttackScore} target=${fakeDefenseScore}`,
    )

    if (target instanceof Hero) {
      Debug.write(`Hero is attacked by ${attacker.char}.`)
      return {
        success: true,
        outcome: 'hero-attacked',
        attacker,
        target,
      }
    }

    if (!(target instanceof Monster)) {
      throw new Error(
        'MeleeAttackCreature only supports Hero or Monster targets',
      )
    }

    this.monsters.remove(target)
    this.events.publish('MonsterKilled', {
      monster: target,
      at: { x: target.x, y: target.y },
    })

    if (attacker instanceof Hero) {
      attacker.kills++
    }

    Debug.write(`${attacker.char} kills ${target.char} in melee.`)
    return {
      success: true,
      outcome: 'target-killed',
      attacker,
      target,
    }
  }
}
