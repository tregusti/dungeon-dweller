import { Layout } from './Layout.js'
import type { Terminal } from './screen/Terminal.js'

const DEBUG = true

let terminal: Terminal | null = null

const log = [] as string[]
const lineLength = process.stdout.columns

export const Debug = {
  enabled: DEBUG,

  initialize({ terminal: t }: { terminal: Terminal }) {
    terminal = t
  },

  // This might be called in tests without #initialize having been called.
  write(text: string) {
    if (!DEBUG) {
      return
    }

    const offset = Layout.game.size.height + 1
    const count = process.stdout.rows - offset
    log.unshift(text.replace(/\n/g, '/'))
    if (terminal) {
      for (let i = 0; i < Math.min(count, log.length); i++) {
        const line = `${log.length - i}: ${log[i]}`.padEnd(lineLength)
        const trimmed =
          line.length > lineLength
            ? line.substring(0, lineLength - 1) + '…'
            : line
        terminal.writeAt(0, offset + i, trimmed)
      }
    }
  },
}
