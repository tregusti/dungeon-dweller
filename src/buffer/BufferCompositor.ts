import { Buffer, BufferEntry } from './Buffer'

/**
 * TODO:
 *
 * - Move x, y, z from Buffer to BufferCompositor.
 * - Add the caching logic to BufferCompositor.
 */

export class BufferCompositor {
  #buffers: Buffer[] = []
  #width: number
  #height: number

  constructor(width: number, height: number) {
    this.#width = width
    this.#height = height
  }

  /**
   * Adds a buffer to the compositor. The buffer will be composited on top of
   * the existing buffers based on its z-index.
   *
   * @param buffer The buffer to add.
   * @returns The added buffer.
   */
  add(buffer: Buffer) {
    this.#buffers.push(buffer)
    // Sort by z (lowest first)
    this.#buffers.sort((a, b) => a.z - b.z)
    return buffer
  }

  flush(callback: (entries: BufferEntry[]) => void) {
    const composed = new Buffer({
      width: this.#width,
      height: this.#height,
      x: 0,
      y: 0,
      z: 0,
    })

    for (let i = 0; i < this.#buffers.length; i++) {
      const buf = this.#buffers[i]
      const entries = buf.entries
      entries.forEach(({ x, y, char }) => {
        // Add to composed buffer with offset
        composed.set(x + buf.x, y + buf.y, char)
      })
    }

    callback(composed.entries)

    // Flush all buffers
    this.#buffers.forEach((buf) => buf.markAsFlushed())
  }
}
