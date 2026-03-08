import { Debug } from '../Debug'
import { Buffer } from './Buffer'
import { Matrix } from './Matrix'

export class BufferCompositor {
  #buffers: Buffer[] = []
  #width: number
  #height: number
  #previous: Matrix

  constructor(width: number, height: number) {
    this.#width = width
    this.#height = height
    this.#previous = new Matrix(width, height)
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
  /**
   * Removes a buffer from the compositor.
   *
   * @param buffer The buffer to remove.
   */
  remove(buffer: Buffer) {
    this.#buffers = this.#buffers.filter((b) => b !== buffer)
  }

  flush(callback: (composed: Matrix) => void) {
    const composed = new Matrix(this.#width, this.#height)
    for (let y = 0; y < this.#height; y++) {
      for (let x = 0; x < this.#width; x++) {
        let char: string | null = null
        // Topmost buffer wins
        for (let i = this.#buffers.length - 1; i >= 0; i--) {
          char = this.#buffers[i].getOffsetCell(x, y)
          if (char !== null) break
        }

        /*
        BUG:
         Here we have an issue. Right now we send ALL chars. So no buffer is
         really implemented. We need to compare with previous and only send if
         different. But the check does not work. every other hero move have
         the last position still present in the matrix.
         */
        // if (char !== this.#previous.get(x, y)) {
        composed.set(x, y, char)
        // }
      }
    }

    // const entries = composed.entries()
    // const nulls = entries.filter((e) => e.char === null).length
    // Debug.write(
    //   `Composed buffer with ${entries.length} changes (${nulls} nulls)`,
    // )
    // Debug.write(composed.debug)
    callback(composed)

    for (let y = 0; y < this.#height; y++) {
      for (let x = 0; x < this.#width; x++) {
        const char = composed.get(x, y)
        if (char !== undefined) {
          this.#previous.set(x, y, char)
        }
      }
    }

    this.#buffers.forEach((buf) => buf.markAsFlushed())
    // Is this really needed?
    composed.markAsFlushed()
    this.#previous = composed
  }
}
