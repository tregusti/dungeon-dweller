export type MaybePromise<T> = T | Promise<T>

export * from 'ts-essentials'

export type Size = {
  width: number
  height: number
}

export type Position = {
  x: number
  y: number
}
export type Spot = Position & {
  // Options for now. Should later be required when we have multiple levels.
  level?: string
}
