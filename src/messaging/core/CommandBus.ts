import { MaybePromise } from '../../types'
import { CommandDef } from './Commands'

type CommandMap = Record<string, CommandDef<string, any, any>>

type CommandHandler<TPayload, TResult> = (
  payload: TPayload,
) => MaybePromise<TResult>

export class CommandBus<TCommands extends CommandMap> {
  private handlers = new Map<keyof TCommands, CommandHandler<any, any>>()

  register<K extends keyof TCommands>(
    type: K,
    handler: CommandHandler<TCommands[K]['payload'], TCommands[K]['result']>,
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
    payload: TCommands[K]['payload'],
  ): Promise<TCommands[K]['result']> {
    const handler = this.handlers.get(type)
    if (!handler) {
      throw new Error(`No command handler registered for "${String(type)}"`)
    }
    return await handler(payload)
  }
}
