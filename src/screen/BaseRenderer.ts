import { BufferCompositor } from '../buffer/BufferCompositor.js'
import { Terminal } from './Terminal.js'

export type BaseRendererArgs = {
  bufferCompositor: BufferCompositor
  terminal: Pick<Terminal, 'clear' | 'writeAt'>
}
export abstract class BaseRenderer {
  protected readonly bufferCompositor: BufferCompositor
  private readonly terminal: BaseRendererArgs['terminal']

  abstract attach(): void

  constructor({ bufferCompositor, terminal }: BaseRendererArgs) {
    this.bufferCompositor = bufferCompositor
    this.terminal = terminal
    this.terminal.clear()
  }

  protected redraw() {
    this.bufferCompositor.flush((entries) => {
      for (const { x, y, char } of entries) {
        // debug: uncolored char comes in here.
        this.terminal.writeAt(x, y, char ?? ' ')
      }
    })
  }
}
