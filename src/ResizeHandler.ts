import { ANSI } from './ansi'
import EventEmitter from 'events'

type ResizeHandlerEvents = {
  /**
   * Emitted when the terminal is resized. The listener receives a boolean
   * indicating whether the terminal is too small to run the game (true if too
   * small, false if large enough).
   */
  resize: [tooSmall: boolean]
}

const MIN_COLS = 60
const MIN_ROWS = 25

export class ResizeHandler extends EventEmitter<ResizeHandlerEvents> {
  attach() {
    // Register resize listener
    process.stdout.on('resize', () => this.handleResize())
  }

  private handleResize() {
    const c = process.stdout.columns || 0
    const r = process.stdout.rows || 0

    if (c < MIN_COLS || r < MIN_ROWS) {
      this.emit('resize', true)
      this.drawBox(c, r)
    } else {
      this.emit('resize', false)
    }
  }

  private drawBox(c: number, r: number) {
    process.stdout.write(ANSI.clearScreen + ANSI.home)

    const content = [
      'Terminal too small',
      `Need at least ${MIN_COLS}x${MIN_ROWS} — current: ${c}x${r}`,
      '',
      `Resize the terminal to at least ${MIN_COLS}x${MIN_ROWS} to continue`,
    ]

    // compute box dimensions
    const pad = 2
    const maxContentWidth = Math.max(...content.map((s) => s.length))
    const boxWidth = Math.min(c - 4, maxContentWidth + pad * 2)
    const boxHeight = content.length + 2 // top+bottom border
    const startCol = Math.max(1, Math.floor((c - boxWidth) / 2) + 1)
    const startRow = Math.max(1, Math.floor((r - boxHeight) / 2) + 1)

    // draw top border
    const horiz = '-'.repeat(boxWidth - 2)
    process.stdout.write(`\x1B[${startRow};${startCol}H+${horiz}+`)

    // draw content lines
    for (let i = 0; i < content.length; i++) {
      const line = content[i]
      const innerWidth = boxWidth - 2
      const leftPad = Math.floor((innerWidth - line.length) / 2)
      const rightPad = innerWidth - line.length - leftPad
      const text = ' '.repeat(leftPad) + line + ' '.repeat(rightPad)
      process.stdout.write(`\x1B[${startRow + 1 + i};${startCol}H|${text}|`)
    }

    // draw bottom border
    process.stdout.write(
      `\x1B[${startRow + boxHeight - 1};${startCol}H+${horiz}+`,
    )
  }
}
