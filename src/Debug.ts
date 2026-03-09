import type { Game } from './Game'
import type { Terminal } from './terminal/Terminal'

let terminal: Terminal | null = null
let game: Game | null = null

const log = [] as string[]
const lineLength = process.stdout.columns
const countLength = 4

export const Debug = {
  initialize({ terminal: t, game: g }: { terminal: Terminal; game: Game }) {
    terminal = t
    game = g
  },
  write(text: string) {
    const offset = game!.height + 1
    const count = process.stdout.rows - offset
    log.unshift(text.replace(/\n/g, '/'))
    if (terminal) {
      for (let i = 0; i < Math.min(count, log.length); i++) {
        terminal.writeAt(
          0,
          offset + i,
          String(log.length - i).padEnd(countLength) +
            log[i].padEnd(lineLength - countLength),
        )
      }
    }
  },
}
