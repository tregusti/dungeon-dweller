type Entry = {
  x: number
  y: number
  char: Char
}

type Char = string | null

export type Cell = {
  /** The character stored in this cell. null indicates an empty cell. */
  char: Char
  /** Whether this cell should be flushed/written on next render even if null. */
  flush: boolean
}

/** Simple wrapper around a 2D array of characters. */
export class Matrix {
  #width: number
  #height: number
  #data: Array<Array<Cell>>

  constructor(width: number, height: number) {
    this.#width = width
    this.#height = height
    this.#data = Array.from({ length: this.#height }, () =>
      Array.from({ length: this.#width }, () => ({
        char: null,
        flush: false,
      })),
    )
  }

  get debug() {
    const p = this.#width + 'x' + this.#height + ': '
    return (
      p +
      this.#data
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

  get width() {
    return this.#width
  }

  get height() {
    return this.#height
  }

  /**
   * Returns an array of entries for all non-null or updated characters in the
   * matrix.
   */
  entries(): Entry[] {
    const entries: Entry[] = []
    for (let y = 0; y < this.#height; y++) {
      for (let x = 0; x < this.#width; x++) {
        const cell = this.#data[y][x]
        if (cell.char !== null || cell.flush) {
          entries.push({ x, y, char: cell.char })
        }
      }
    }
    return entries
  }

  markAsFlushed(): void {
    for (let y = 0; y < this.#height; y++) {
      for (let x = 0; x < this.#width; x++) {
        this.#data[y][x].flush = false
      }
    }
  }

  get(x: number, y: number): Char {
    return this.#data[y][x].char
  }

  set(x: number, y: number, char: Char) {
    this.#data[y][x] = { char, flush: true }
  }
}
