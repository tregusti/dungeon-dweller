import { BufferCompositor } from '../buffer/BufferCompositor'
import { Terminal } from './Terminal'

// let flushes = 0
export const flushBuffer = (terminal: Terminal, buffer: BufferCompositor) => {
  buffer.flush((entries) => {
    // Debug.write(
    //   `Flushing (${++flushes}) buffer with ${entries.length} entries.`,
    // )
    for (const { x, y, char } of entries) {
      terminal.writeAt(x, y, char ?? ' ')
    }
  })
}
