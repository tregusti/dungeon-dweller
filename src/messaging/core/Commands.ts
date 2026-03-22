import * as CreateHero from '../commands/CreateHero'
import * as CreateMonster from '../commands/CreateMonster'
import * as MoveHero from '../commands/MoveHero'
import * as MoveMonster from '../commands/MoveMonster'
import * as ProcessMonsterRound from '../commands/ProcessMonsterRound'
import * as ProcessUntilHeroReady from '../commands/ProcessUntilHeroReady'

export const CommandType = {
  // Hero
  CreateHero: CreateHero.CreateHeroCommandType,
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
