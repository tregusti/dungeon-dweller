import {
  MoveHeroCommandPayload,
  MoveHeroCommandResult,
  MoveHeroCommandType,
} from '../commands/MoveHero'

export const CommandType = {
  MoveHero: MoveHeroCommandType,
} as const

type CommandDef<TPayload, TResult> = {
  payload: TPayload
  result: TResult
}

export type Commands = {
  [CommandType.MoveHero]: CommandDef<
    MoveHeroCommandPayload,
    MoveHeroCommandResult
  >
}
