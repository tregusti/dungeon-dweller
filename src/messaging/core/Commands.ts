import * as CreateHero from '../commands/CreateHeroCommand'
import * as CreateMonster from '../commands/CreateMonsterCommand'
import * as MeleeAttackCreature from '../commands/MeleeAttackCreatureCommand'
import * as MoveHero from '../commands/MoveHeroCommand'
import * as MoveMonster from '../commands/MoveMonsterCommand'
import * as ProcessMonsterRound from '../commands/ProcessMonsterRoundCommand'
import * as ProcessUntilHeroReady from '../commands/ProcessUntilHeroReadyCommand'

export const CommandType = {
  // Hero
  CreateHero: CreateHero.CreateHeroCommandType,
  MeleeAttackCreature: MeleeAttackCreature.MeleeAttackCreatureCommandType,
  MoveHero: MoveHero.MoveHeroCommandType,

  // Monsters
  CreateMonster: CreateMonster.CreateMonsterCommandType,
  MoveMonster: MoveMonster.MoveMonsterCommandType,
  ProcessMonsterRound: ProcessMonsterRound.ProcessMonsterRoundCommandType,

  // Turn orchestration
  ProcessUntilHeroReady: ProcessUntilHeroReady.ProcessUntilHeroReadyCommandType,
} as const

export type CommandDef<TPayload, TResult> = {
  payload: TPayload
  result: TResult
}

export type Commands = {
  [CommandType.CreateHero]: CommandDef<
    CreateHero.CreateHeroCommandPayload,
    CreateHero.CreateHeroCommandResult
  >
  [CommandType.MeleeAttackCreature]: CommandDef<
    MeleeAttackCreature.MeleeAttackCreatureCommandPayload,
    MeleeAttackCreature.MeleeAttackCreatureCommandResult
  >
  [CommandType.CreateMonster]: CommandDef<
    CreateMonster.CreateMonsterCommandPayload,
    CreateMonster.CreateMonsterCommandResult
  >
  [CommandType.MoveHero]: CommandDef<
    MoveHero.MoveHeroCommandPayload,
    MoveHero.MoveHeroCommandResult
  >
  [CommandType.MoveMonster]: CommandDef<
    MoveMonster.MoveMonsterCommandPayload,
    MoveMonster.MoveMonsterCommandResult
  >
  [CommandType.ProcessMonsterRound]: CommandDef<
    ProcessMonsterRound.ProcessMonsterRoundCommandPayload,
    ProcessMonsterRound.ProcessMonsterRoundCommandResult
  >
  [CommandType.ProcessUntilHeroReady]: CommandDef<
    ProcessUntilHeroReady.ProcessUntilHeroReadyCommandPayload,
    ProcessUntilHeroReady.ProcessUntilHeroReadyCommandResult
  >
}
