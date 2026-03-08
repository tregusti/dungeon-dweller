// General-purpose buffer for any rectangular region of the screen

import { Matrix } from './Matrix'

export class Buffer {
  readonly width: number
  readonly height: number
  readonly offsetX: number
  readonly offsetY: number
  readonly z: number
  private values: Matrix

  constructor({
    width,
    height,
    offsetX = 0,
    offsetY = 0,
    z = 0,
  }: {
    width: number
    height: number
    offsetX?: number
    offsetY?: number
    z?: number
  }) {
    this.width = width
    this.height = height
    this.offsetX = offsetX
    this.offsetY = offsetY
    this.z = z
    this.values = new Matrix(width, height)
  }

  clear() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.clearCell(x, y)
      }
    }
  }

  clearCell(x: number, y: number) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.values.set(x, y, null)
    }
  }

  setCell(x: number, y: number, char: string) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.values.set(x, y, char)
    }
  }

  setLine(y: number, text: string) {
    this.setText(0, y, text.padEnd(this.width))
  }

  setText(x: number, y: number, text: string) {
    for (let i = 0; i < text.length; i++) {
      this.setCell(x + i, y, text[i])
    }
  }

  /**
   * Get the character at the given global coordinates, accounting for buffer
   * offset.
   *
   * @param globalX The horizontal position in the full game view .
   * @param globalY The vertical position in the full game view.
   * @returns The character at the given global coordinates. If no value or out
   *   of bounds, returns null.
   */
  getOffsetCell(globalX: number, globalY: number): string | null {
    const x = globalX - this.offsetX
    const y = globalY - this.offsetY
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.values.get(x, y)
    }
    // Out of bounds for this buffer
    return null
  }

  // For diff rendering: get current char at local coords
  getCell(x: number, y: number) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.values.get(x, y)
    }
    return null
  }

  markAsFlushed() {
    this.values.markAsFlushed()
  }
}
