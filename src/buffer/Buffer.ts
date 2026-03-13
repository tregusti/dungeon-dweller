import { Position, Size } from '../types'

type Char = string | null

type Cell = {
  char: Char
  flush: boolean
}

export type BufferEntry = {
  char: Char
} & Position

export class Buffer {
  readonly width: number
  readonly height: number
  private data: Array<Array<Cell>>

  constructor({ width, height }: Size) {
    this.width = width
    this.height = height
    this.data = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => ({ char: null, flush: false })),
    )
  }

  /** Clears the entire buffer. */
  clear(): void
  /** Clears a specific line in the buffer. */
  clear(line: number): void
  /** Clears a specific cell in the buffer. */
  clear(x: number, y: number): void
  clear(...args: number[]) {
    // Clear a line
    if (args.length === 1) {
      const [line] = args
      for (let x = 0; x < this.width; x++) {
        this.set(x, line, null)
      }

      // Clear a cell
    } else if (args.length === 2) {
      const [x, y] = args
      this.set(x, y, null)

      // Clear entire buffer
    } else {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          this.set(x, y, null)
        }
      }
    }
  }

  set(x: number, y: number, char: Char) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.data[y][x] = { char, flush: true }
    }
  }

  text(x: number, y: number, text: string) {
    for (let i = 0; i < text.length; i++) {
      this.set(x + i, y, text[i])
    }
  }
  line(y: number, text: string) {
    this.text(0, y, text.padEnd(this.width))
  }

  get(x: number, y: number): Char {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.data[y][x].char
    }
    return null
  }

  markAsFlushed() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.data[y][x].flush = false
      }
    }
  }

  get entries(): Readonly<BufferEntry>[] {
    const entries: BufferEntry[] = []
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.data[y][x]
        if (cell.char !== null || cell.flush) {
          entries.push({ x, y, char: cell.char })
        }
      }
    }
    return entries
  }

  get debug() {
    const p = this.width + 'x' + this.height + ': '
    return (
      p +
      this.data
        .map((row) =>
          row
            .map((cell) => {
              if (cell.char === null) {
                return cell.flush ? ' ' : '·'
              }
              return cell.char
            })
            .join(''),
        )
        .join('\n')
    )
  }
}
