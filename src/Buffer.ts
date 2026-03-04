// General-purpose buffer for any rectangular region of the screen
// Supports compositing via getCharAt (global coordinates)
export class Buffer {
  readonly width: number
  readonly height: number
  readonly offsetX: number
  readonly offsetY: number
  readonly z: number
  private current: string[][]
  private previous: string[][]

  constructor(width: number, height: number, offsetX = 0, offsetY = 0, z = 0) {
    this.width = width
    this.height = height
    this.offsetX = offsetX
    this.offsetY = offsetY
    this.z = z
    this.current = Array.from({ length: height }, () => Array(width).fill(' '))
    this.previous = Array.from({ length: height }, () => Array(width).fill(' '))
  }

  clear(fill = ' ') {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.current[y][x] = fill
      }
    }
  }

  setCell(x: number, y: number, char: string) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.current[y][x] = char
    }
  }

  getCharAt(globalX: number, globalY: number): string | null {
    const x = globalX - this.offsetX
    const y = globalY - this.offsetY
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.current[y][x]
    }
    return null
  }

  // For diff rendering: get current char at local coords
  getCell(x: number, y: number): string {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.current[y][x]
    }
    return ' '
  }

  // Force the renderer to treat all cells as changed on next render
  invalidatePrevious() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.previous[y][x] = '\0'
      }
    }
  }

  // Used by the compositor to update previous state after rendering
  updatePrevious() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.previous[y][x] = this.current[y][x]
      }
    }
  }
}

// Compositor: manages multiple buffers and renders them in z-order
export class Compositor {
  private buffers: Buffer[] = []
  private screenWidth: number
  private screenHeight: number
  private previous: string[][]
  private hideCursor: () => void

  constructor(screenWidth: number, screenHeight: number, hideCursor: () => void) {
    this.screenWidth = screenWidth
    this.screenHeight = screenHeight
    this.hideCursor = hideCursor
    this.previous = Array.from({ length: screenHeight }, () => Array(screenWidth).fill(' '))
  }

  setBuffers(buffers: Buffer[]) {
    // Sort by z (lowest first)
    this.buffers = buffers.slice().sort((a, b) => a.z - b.z)
  }

  invalidatePrevious() {
    for (let y = 0; y < this.screenHeight; y++) {
      for (let x = 0; x < this.screenWidth; x++) {
        this.previous[y][x] = '\0'
      }
    }
  }

  render() {
    for (let y = 0; y < this.screenHeight; y++) {
      for (let x = 0; x < this.screenWidth; x++) {
        let char: string | null = null
        // Topmost buffer wins
        for (let i = this.buffers.length - 1; i >= 0; i--) {
          char = this.buffers[i].getCharAt(x, y)
          if (char !== null && char !== ' ') break
        }
        if (char === null) char = ' '
        if (char !== this.previous[y][x]) {
          process.stdout.write(`\x1B[${y + 1};${x + 1}H${char}`)
          this.previous[y][x] = char
        }
      }
    }
    this.hideCursor()
    // After rendering, update all buffer previous states
    for (const buf of this.buffers) buf.updatePrevious()
  }
}
