import { Buffer } from '../buffer/Buffer'
import { BufferCompositor } from '../buffer/BufferCompositor'
import { EventBus } from '../messaging/core/EventBus'
import { EventType } from '../messaging/core/Events'
import type { Events } from '../messaging/core/Events'
import { Terminal } from '../screen/Terminal'

export class Renderer {
  constructor(
    private dungeonBuffer: Buffer,
    private bufferCompositor: BufferCompositor,
    private terminal: Terminal,
    private events: EventBus<Events>,
  ) {}

  attach() {
    this.events.subscribe(EventType.HeroMoved, ({ hero, from, to }) => {
      this.dungeonBuffer.clear(from.x, from.y)
      this.dungeonBuffer.set(to.x, to.y, hero.char)
      this.redraw()
    })
    this.events.subscribe(EventType.MonsterCreated, ({ monster, at }) => {
      this.dungeonBuffer.set(at.x, at.y, monster.char)
      this.redraw()
    })
    this.events.subscribe(EventType.MonsterMoved, ({ monster, from, to }) => {
      this.dungeonBuffer.clear(from.x, from.y)
      this.dungeonBuffer.set(to.x, to.y, monster.char)
      this.redraw()
    })
  }

  private redraw() {
    this.bufferCompositor.flush((entries) => {
      for (const { x, y, char } of entries) {
        this.terminal.writeAt(x, y, char ?? '.')
      }
    })
  }
}
