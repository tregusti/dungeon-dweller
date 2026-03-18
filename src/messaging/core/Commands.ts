import {
  MoveHeroCommandPayload,
  MoveHeroCommandResult,
} from '../commands/MoveHero'

export const CommandType = {
  MoveHero: Symbol('MoveHero'),
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
