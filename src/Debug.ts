let terminal: any = null

const log = [] as string[]
const offset = 14
const lineLength = process.stdout.columns
const countLength = 4

export const Debug = {
  setTerminal(t: any) {
    terminal = t
  },
  write(text: string) {
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
