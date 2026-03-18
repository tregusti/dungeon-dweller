type EventHandler<TPayload> = (payload: TPayload) => void | Promise<void>

type EventMap = Record<string, any>

export class EventBus<TEvents extends EventMap> {
  private listeners = new Map<keyof TEvents, EventHandler<any>[]>()

  subscribe<K extends keyof TEvents>(
    type: K,
    handler: EventHandler<TEvents[K]>,
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
    payload: TEvents[K],
  ): Promise<void> {
    const handlers = this.listeners.get(type)
    if (!handlers || handlers.length === 0) return

    for (const handler of [...handlers]) {
      await handler(payload)
    }
  }
}
