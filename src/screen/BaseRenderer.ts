import { BufferCompositor } from '../buffer/BufferCompositor'
import { Terminal } from './Terminal'

export abstract class BaseRenderer {
  protected readonly bufferCompositor: BufferCompositor
  private readonly terminal: Terminal

  abstract attach(): void

  constructor({
    bufferCompositor,
    terminal,
  }: {
    bufferCompositor: BufferCompositor
    terminal: Terminal
  }) {
    this.bufferCompositor = bufferCompositor
    this.terminal = terminal
    this.terminal.clear()
  }

  protected redraw() {
    this.bufferCompositor.flush((entries) => {
      for (const { x, y, char } of entries) {
        this.terminal.writeAt(x, y, char ?? '.')
      }
    })
  }
}
