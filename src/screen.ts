// Screen buffer for efficient rendering
// Keeps track of current and previous screen state and only renders changes

class Screen {
  private current: string[][]
  private previous: string[][]
  private cols: number
  private rows: number

  constructor(cols: number, rows: number) {
    this.cols = cols
    this.rows = rows
    this.current = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(' '))
    this.previous = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(' '))
  }

  clear() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.current[y][x] = '.'
      }
    }
  }

  // Force the renderer to treat all cells as changed on next render
  invalidatePrevious() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.previous[y][x] = '\0'
      }
    }
  }

  setCell(x: number, y: number, char: string) {
    if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
      this.current[y][x] = char
    }
  }

  getCell(x: number, y: number): string {
    if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
      return this.current[y][x]
    }
    return ' '
  }

  render(hideCursor: () => void) {
    // only render changed cells
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.current[y][x] !== this.previous[y][x]) {
          process.stdout.write(`\x1B[${y + 1};${x + 1}H${this.current[y][x]}`)
          this.previous[y][x] = this.current[y][x]
        }
      }
    }
    hideCursor()
  }
}

export default Screen
