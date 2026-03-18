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
export type Position3D = Position & {
  z: number
}
