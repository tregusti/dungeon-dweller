import * as CreateHero from '../commands/CreateHero'
import * as CreateMonster from '../commands/CreateMonster'
import * as MoveHero from '../commands/MoveHero'

export const CommandType = {
  // Hero
  CreateHero: CreateHero.CreateHeroCommandType,
  MoveHero: MoveHero.MoveHeroCommandType,

  // Monsters
  CreateMonster: CreateMonster.CreateMonsterCommandType,
} as const

type CommandDef<TPayload, TResult> = {
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
}
