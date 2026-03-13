import { Position3D, Size } from '../types'
import { Buffer, BufferEntry } from './Buffer'

/**
 * TODO:
 *
 * - Add the caching logic to BufferCompositor.
 */

type CompositorEntry = Position3D & { buffer: Buffer }

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
   * the existing buffers based on its z-index.
   *
   * @param buffer The buffer to add.
   * @returns The added buffer.
   */
  add({
    buffer,
    x,
    y,
    z,
  }: {
    buffer: Buffer
    x: number
    y: number
    z: number
  }) {
    this.#buffers.push({ buffer, x, y, z })
    // Sort by z (lowest first)
    this.#buffers.sort((a, b) => a.z - b.z)
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
        // Add to composed buffer with offset
        composed.set(x + ce.x, y + ce.y, char)
      })
    }

    callback(composed.entries)

    // Flush all buffers
    this.#buffers.forEach((buf) => buf.buffer.markAsFlushed())
  }
}
