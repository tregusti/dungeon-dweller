// Side-effect imports activate each command's interface augmentation below
import '../commands/CreateHeroCommand'
import '../commands/CreateMonsterCommand'
import '../commands/MeleeAttackCreatureCommand'
import '../commands/MoveHeroCommand'
import '../commands/MoveMonsterCommand'
import '../commands/ProcessMonsterRoundCommand'
import '../commands/ProcessUntilHeroReadyCommand'

export type CommandDef<TPayload, TResult> = {
  payload: TPayload
  result: TResult
}

// Built up via interface merging in each command's handler file
export interface Commands {}
