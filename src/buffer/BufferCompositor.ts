import { Position, Size } from '../types'
import { Buffer, BufferEntry } from './Buffer'

type CompositorEntry = Position & { buffer: Buffer; layer: number }

export class BufferCompositor {
  #buffers: CompositorEntry[] = []
  #width: number
  #height: number

  constructor({ width, height }: Size) {
    this.#width = width
    this.#height = height
  }

  /**
   * Adds a buffer to the compositor. The buffer will be composited on top of
   * the existing buffers based on its layer index.
   *
   * @param buffer The buffer to add.
   * @returns The added buffer.
   */
  add({
    buffer,
    x,
    y,
    layer,
  }: {
    buffer: Buffer
    x: number
    y: number
    layer: number
  }) {
    this.#buffers.push({ buffer, x, y, layer })
    // Sort by layer (lowest first)
    this.#buffers.sort((a, b) => a.layer - b.layer)
    return buffer
  }

  flush(callback: (entries: BufferEntry[]) => void) {
    const composed = new Buffer({
      width: this.#width,
      height: this.#height,
    })

    for (let i = 0; i < this.#buffers.length; i++) {
      const ce = this.#buffers[i]
      ce.buffer.entries.forEach(({ x, y, char }) => {
        const hasPrevValue = composed.get(x + ce.x, y + ce.y) !== null
        if (!(char === null && hasPrevValue)) {
          composed.set(x + ce.x, y + ce.y, char)
        }
      })
    }

    callback(composed.entries)

    // Flush all buffers
    this.#buffers.forEach((buf) => buf.buffer.markAsFlushed())
  }
}
