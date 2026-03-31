import EventEmitter from 'events'

import { Debug } from '../Debug.js'
import { ANSI } from './ANSI.js'

const ExitCodes = {
  OK: 0,
  GENERIC_ERROR: 1,
  TOO_SMALL: 2,

  SIGHUP: 128 + 1,
  SIGINT: 128 + 2,
  SIGTERM: 128 + 15,
  SIGBREAK: 128 + 21,
}

type TerminalEvents = {
  input: [chunk: string]
}

export class Terminal extends EventEmitter<TerminalEvents> {
  private minWidth: number
  private minHeight: number
  constructor(minWidth: number, minHeight: number) {
    super()
    this.minWidth = minWidth
    this.minHeight = minHeight

    if (!process.stdin.isTTY) {
      console.error('Error: stdin is not a TTY')
      this.exit(ExitCodes.GENERIC_ERROR)
    }

    if (minWidth > process.stdout.columns || minHeight > process.stdout.rows) {
      this.writeSizeWarning()
      this.exit(ExitCodes.TOO_SMALL)
    }

    this.attachExitHandlers()
    process.stdin.on('data', (chunk) => this.emit('input', chunk.toString()))

    process.stdin.setEncoding('utf8')
    process.stdin.setRawMode(true)
    process.stdin.resume()
    this.hideCursor()
  }

  exit(code: number = ExitCodes.OK) {
    process.exit(code)
  }
  clear() {
    process.stdout.write(ANSI.clearScreen + ANSI.home)
  }
  hideCursor() {
    process.stdout.write(ANSI.hideCursor)
  }
  showCursor() {
    process.stdout.write(ANSI.showCursor)
  }
  writeAt(x: number, y: number, text: string) {
    process.stdout.write(`\x1B[${y + 1};${x + 1}H${text}`)
  }

  private writeSizeWarning() {
    const c = process.stdout.columns || 0
    const r = process.stdout.rows || 0

    this.clear()
    console.error(`
  Terminal too small.
  Need at least ${this.minWidth}x${this.minHeight}, got ${c}x${r}.
`)
  }

  private attachExitHandlers() {
    // Last code executed (even after the process receives a kill signal)
    process.on('exit', () => {
      cleanup()
    })

    const cleanup = () => {
      process.stdin.setRawMode(false)
      this.showCursor()
      this.clear()
    }

    // Catch signals and exit gracefully
    const exit = (code: number, error?: Error | unknown) => {
      if (Debug.enabled) {
        console.error(`Exiting with code ${code}`)
        if (error) {
          console.error(error)
        }
      }
      process.exit(code)
    }

    process.on('SIGHUP', () => exit(ExitCodes.SIGHUP))
    process.on('SIGINT', () => exit(ExitCodes.SIGINT))
    process.on('SIGTERM', () => exit(ExitCodes.SIGTERM))
    process.on('SIGBREAK', () => exit(ExitCodes.SIGBREAK))
    process.on('uncaughtException', (e) => exit(ExitCodes.GENERIC_ERROR, e))
    process.on('unhandledRejection', (e) => exit(ExitCodes.GENERIC_ERROR, e))
  }
}
