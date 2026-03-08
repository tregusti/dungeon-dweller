import { BufferCompositor } from '../buffer/BufferCompositor'
import { Terminal } from './Terminal'

// let flushes = 0
export const flushBuffer = (terminal: Terminal, buffer: BufferCompositor) => {
  // Debug.write(`Flushing (${++flushes}) buffer at tick ${tick}, turns ${turns}`)
  buffer.flush((composed) => {
    const entries = composed.entries()
    for (const { x, y, char } of entries) {
      terminal.writeAt(x, y, char ?? ' ')
    }
  })
}
