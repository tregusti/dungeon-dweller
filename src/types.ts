export type MaybePromise<T> = T | Promise<T>

export * from 'ts-essentials'

export type Size = {
  width: number
  height: number
}

export type Coords = {
  x: number
  y: number
}
export type Cell = Coords & {
  levelId: string
}
