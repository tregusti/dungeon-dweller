export * from 'ts-essentials'

export type MaybePromise<T> = T | Promise<T>

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
export type PickValues<T, K extends readonly (keyof T)[]> = {
  [I in keyof K]: T[K[I]]
}
