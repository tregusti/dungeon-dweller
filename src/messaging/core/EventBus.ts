import type { EventDef } from './Events'

type EventHandler<TPayload> = (payload: TPayload) => void | Promise<void>

type EventMap = Record<symbol, EventDef<unknown>>

type EventBusPayload<TEvents extends EventMap, K extends keyof TEvents> =
  TEvents[K] extends EventDef<infer TPayload> ? TPayload : never

export class EventBus<TEvents extends EventMap> {
  private listeners = new Map<keyof TEvents, EventHandler<any>[]>()

  subscribe<K extends keyof TEvents>(
    type: K,
    handler: EventHandler<EventBusPayload<TEvents, K>>,
  ): () => void {
    const list = this.listeners.get(type) ?? []
    list.push(handler)
    this.listeners.set(type, list)

    return () => {
      const current = this.listeners.get(type)
      if (!current) return
      const idx = current.indexOf(handler)
      if (idx >= 0) current.splice(idx, 1)
      if (current.length === 0) this.listeners.delete(type)
    }
  }

  async publish<K extends keyof TEvents>(
    type: K,
    payload: EventBusPayload<TEvents, K>,
  ): Promise<void> {
    const handlers = this.listeners.get(type)
    if (!handlers || handlers.length === 0) return

    for (const handler of [...handlers]) {
      await handler(payload)
    }
  }
}
