import { ANSI } from './ansi'

export class ResizeHandler {
  private showCursor: () => void
  private hideCursor: () => void
  private dataHandler: (chunk: string) => void
  private redraw: () => void
  private attached = false

  constructor(
    showCursor: () => void,
    hideCursor: () => void,
    dataHandler: (chunk: string) => void,
    redraw: () => void,
  ) {
    this.showCursor = showCursor
    this.hideCursor = hideCursor
    this.dataHandler = dataHandler
    this.redraw = redraw
  }

  attach() {
    // Initially attach the input handler (terminal is valid at startup)
    process.stdin.on('data', this.dataHandler)
    this.attached = true
    // Register resize listener
    process.stdout.on('resize', () => this.handleResize())
  }

  private handleResize() {
    const c = process.stdout.columns || 0
    const r = process.stdout.rows || 0

    if (c < 60 || r < 25) {
      // Terminal too small: detach input handler
      if (this.attached) {
        process.stdin.removeListener('data', this.dataHandler)
        this.attached = false
      }
      this.drawBox(c, r)
    } else if (!this.attached) {
      // Terminal recovered: reattach input handler
      this.hideCursor()
      process.stdout.write(ANSI.clearScreen + ANSI.home)
      process.stdin.on('data', this.dataHandler)
      this.attached = true
      this.redraw()
    }
  }

  private drawBox(c: number, r: number) {
    this.showCursor()
    process.stdout.write(ANSI.clearScreen + ANSI.home)

    const content = [
      'Terminal too small',
      `Need at least 60x25 — current: ${c}x${r}`,
      '',
      'Resize the terminal to at least 60x25 to continue',
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
    process.stdout.write(`\x1B[${startRow + boxHeight - 1};${startCol}H+${horiz}+`)
  }
}
