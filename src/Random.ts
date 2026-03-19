/*
- PRNG see https://gemini.google.com/share/49c3dda200ae
*/

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

/**
 * Generate a random number between 0 and max (inclusive).
 * @param max Maximum allowed value.
 */
function int(max: number): number
/**
 * Generate a random number between min and max (inclusive).
 * @param min Minimum allowed value.
 * @param max Maximum allowed value.
 */
function int(min: number, max: number): number
function int(...args: [number] | [number, number]): number {
  let { min, max } = getMinMax(...(args as [number]))
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const Random = {
  int,
}

export type Random = typeof Random
