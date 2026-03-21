import { Buffer } from '../buffer/Buffer'
import { BufferCompositor } from '../buffer/BufferCompositor'
import { Bus } from '../messaging/core'
import { EventType } from '../messaging/core/Events'
import { Terminal } from '../screen/Terminal'

export class Renderer {
  constructor(
    private dungeonBuffer: Buffer,
    private bufferCompositor: BufferCompositor,
    private terminal: Terminal,
  ) {}

  attach() {
    Bus.event.subscribe(EventType.HeroMoved, ({ hero, from, to }) => {
      this.dungeonBuffer.clear(from.x, from.y)
      this.dungeonBuffer.set(to.x, to.y, hero.char)
      this.redraw()
    })
    Bus.event.subscribe(EventType.MonsterCreated, ({ monster, at }) => {
      this.dungeonBuffer.set(at.x, at.y, monster.char)
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
