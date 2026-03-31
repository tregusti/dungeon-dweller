/**
 * Wrappers around Jest's expect function and add TypeScript type assertions.
 *
 * _expect is this version:
 * https://github.com/8hobbies/test-utils/blob/69e4434248d600d9e2eaf2c553e305cd0a2dc521/src/expect.ts
 */

export * from './_expect.js'

export function expectToHaveProperty<
  T extends Record<K, any>,
  K extends string,
>(
  arg: unknown,
  property: K,
  expectedValue?: unknown,
): asserts arg is T & Record<K, unknown> {
  if (expectedValue !== undefined) {
    expect(arg).toHaveProperty(property, expectedValue)
  } else {
    expect(arg).toHaveProperty(property)
  }
}
