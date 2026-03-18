import { CommandBus } from './CommandBus'
import { Commands } from './Commands'
import { EventBus } from './EventBus'
import { Events } from './Events'

export type { CommandDef } from './Commands'

export const Bus = {
  command: new CommandBus<Commands>(),
  event: new EventBus<Events>(),
}
