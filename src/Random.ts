import seedrandom from 'seedrandom'

export type RandomGenerator = {
  int(max: number): number
  int(min: number, max: number): number
  float(): number
  choice<T>(arr: T[]): T
  create(seed: string): RandomGenerator
}

export class Random implements RandomGenerator {
  private prng: seedrandom.PRNG
  private seed: string

  constructor(seed: string) {
    this.seed = seed
    this.prng = seedrandom(seed)
    this.prng() // Discard the first value, which might be less random
  }

  /**
   * Get a random float number between 0 and 1.
   */
  float(): number {
    return this.prng()
  }
  /**
   * Generate a random number between 0 and max (inclusive).
   * @param max Maximum allowed value.
   */
  int(max: number): number
  /**
   * Generate a random number between min and max (inclusive).
   * @param min Minimum allowed value.
   * @param max Maximum allowed value.
   */
  int(min: number, max: number): number
  int(...args: [number] | [number, number]): number {
    let { min, max } = getMinMax(...(args as [number]))
    return Math.floor(this.prng() * (max - min + 1)) + min
  }

  choice<T>(arr: T[]): T {
    if (arr.length === 0) {
      throw new Error('Cannot choose from an empty array')
    }
    const idx = this.int(arr.length - 1)
    return arr[idx]
  }

  /** Create child Random instance with a new seed based on its parent seed. */
  create(seed: string): Random {
    const childSeed = `${this.seed}:${seed}`
    return new Random(childSeed)
  }
}

function getMinMax(
  minOrMax: number,
  max?: number,
): { min: number; max: number } {
  let min = minOrMax
  if (max === undefined) {
    max = minOrMax
    min = 0
  }
  return { min, max }
}
