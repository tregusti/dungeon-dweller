import chalk from 'chalk'

export type Color =
  | 'red'
  | 'brightred'
  | 'green'
  | 'brightgreen'
  | 'blue'
  | 'brightblue'
  | 'yellow'
  | 'brightyellow'
  | 'magenta'
  | 'brightmagenta'
  | 'cyan'
  | 'brightcyan'
  | 'white'
  | 'brightwhite'
  | 'black'
  | 'gray'

type ChalkColorFunctionKey<T> = {
  [K in keyof T]-?: T[K] extends (text: string) => string ? K : never
}[keyof T]

export const colorize = (text: string, color: Color) => {
  const translations: Record<Color, ChalkColorFunctionKey<typeof chalk>> = {
    red: 'red',
    brightred: 'redBright',
    green: 'green',
    brightgreen: 'greenBright',
    blue: 'blue',
    brightblue: 'blueBright',
    yellow: 'yellow',
    brightyellow: 'yellowBright',
    magenta: 'magenta',
    brightmagenta: 'magentaBright',
    cyan: 'cyan',
    brightcyan: 'cyanBright',
    white: 'white',
    brightwhite: 'whiteBright',
    black: 'black',
    gray: 'blackBright',
  }
  const colorFunc = chalk[translations[color]]
  return colorFunc ? colorFunc(text) : text
}
