import * as CreateMonster from '../commands/CreateMonster'
import * as MoveHero from '../commands/MoveHero'

export const CommandType = {
  MoveHero: MoveHero.MoveHeroCommandType,
  CreateMonster: CreateMonster.CreateMonsterCommandType,
} as const

type CommandDef<TPayload, TResult> = {
  payload: TPayload
  result: TResult
}

export type Commands = {
  [CommandType.CreateMonster]: CommandDef<
    CreateMonster.CreateMonsterCommandPayload,
    CreateMonster.CreateMonsterCommandResult
  >
  [CommandType.MoveHero]: CommandDef<
    MoveHero.MoveHeroCommandPayload,
    MoveHero.MoveHeroCommandResult
  >
}
