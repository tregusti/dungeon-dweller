import { MoveHeroCommand } from '../commands/MoveHero'

export type CommandDef<TType extends string, TPayload, TResult> = {
  type: TType
  payload: TPayload
  result: TResult
}
type CommandMapFromUnion<T extends CommandDef<string, any, any>> = {
  [C in T as C['type']]: C
}

export type Commands = CommandMapFromUnion<MoveHeroCommand>
