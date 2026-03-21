import type { Game } from './Game'
import type { Terminal } from './screen/Terminal'

const DEBUG = true

let terminal: Terminal | null = null
let game: Game | null = null

const log = [] as string[]
const lineLength = process.stdout.columns

export const Debug = {
  enabled: DEBUG,

  initialize({ terminal: t, game: g }: { terminal: Terminal; game: Game }) {
    terminal = t
    game = g
  },

  // This might be called in tests without #initialize having been called.
  write(text: string) {
    if (!DEBUG) {
      return
    }

    const offset = game ? game.height + 1 : 0
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
