import { MaybePromise } from '../../types'
import { CommandDef } from './Commands'

type CommandPayload<TCommands, K extends keyof TCommands> =
  TCommands[K] extends CommandDef<infer TPayload, unknown> ? TPayload : never

type CommandResult<TCommands, K extends keyof TCommands> =
  TCommands[K] extends CommandDef<unknown, infer TResult> ? TResult : never

type CommandExecuteArgs<TPayload> = [TPayload] extends [void]
  ? []
  : [payload: TPayload]

type CommandHandler<TPayload, TResult> = [TPayload] extends [void]
  ? () => MaybePromise<TResult>
  : (payload: TPayload) => MaybePromise<TResult>

type AnyCommandHandler = (...args: any[]) => MaybePromise<any>

export class CommandBus<
  TCommands extends { [K in keyof TCommands]: CommandDef<unknown, unknown> },
> {
  private handlers = new Map<keyof TCommands, AnyCommandHandler>()

  register<K extends keyof TCommands>(
    type: K,
    handler: CommandHandler<
      CommandPayload<TCommands, K>,
      CommandResult<TCommands, K>
    >,
  ): void {
    if (this.handlers.has(type)) {
      throw new Error(
        `Command handler already registered for "${String(type)}"`,
      )
    }
    this.handlers.set(type, handler)
  }

  async execute<K extends keyof TCommands>(
    type: K,
    ...args: CommandExecuteArgs<CommandPayload<TCommands, K>>
  ): Promise<CommandResult<TCommands, K>> {
    const handler = this.handlers.get(type)
    if (!handler) {
      throw new Error(`No command handler registered for "${String(type)}"`)
    }
    return await handler(...(args as any[]))
  }
}
