---
name: javascript-typescript-jest
description:
  'Best practices for writing JavaScript/TypeScript tests using Jest, including
  mocking strategies, test structure, and common patterns.'
source: https://awesome-copilot.github.com/skills/#file=skills%2Fjavascript-typescript-jest%2FSKILL.md
---

### Test Structure

- Name test files with `.test.ts` suffix
- Place test files next to the code they test
- Use descriptive test names that explain the expected behavior
- Use nested describe blocks to organize related tests
- Follow the pattern:
  ```typescript
  describe('Component/Function/Class', () => {
    // Optionally use a when or with block for scenario grouping
    describe('when/with ...', () => {
      it('should do something', () => {})
    })
  })
  ```

### Effective Mocking

- Mock external dependencies (APIs, databases, etc.) to isolate your tests
- Use `jest.mock()` for module-level mocks
- Use `jest.spyOn()` for specific function mocks
- Use `mockImplementation()` or `mockReturnValue()` to define mock behavior
- Reset mocks between tests with `jest.resetAllMocks()` in `afterEach`

### Testing Async Code

- Always return promises or use async/await syntax in tests
- Use `resolves`/`rejects` matchers for promises
- Set appropriate timeouts for slow tests with `jest.setTimeout()`

### Snapshot Testing

- Use snapshot tests for UI components or complex objects that change
  infrequently
- Keep snapshots small and focused
- Review snapshot changes carefully before committing

## Common Jest Matchers

- Basic: `expect(value).toBe(expected)`, `expect(value).toEqual(expected)`
- Truthiness: `expect(value).toBeTruthy()`, `expect(value).toBeFalsy()`
- Numbers: `expect(value).toBeGreaterThan(3)`,
  `expect(value).toBeLessThanOrEqual(3)`
- Strings: `expect(value).toMatch(/pattern/)`,
  `expect(value).toContain('substring')`
- Arrays: `expect(array).toContain(item)`, `expect(array).toHaveLength(3)`
- Objects: `expect(object).toHaveProperty('key', value)`
- Exceptions: `expect(fn).toThrow()`, `expect(fn).toThrow(Error)`
- Mock functions: `expect(mockFn).toHaveBeenCalled()`,
  `expect(mockFn).toHaveBeenCalledWith(arg1, arg2)`

Please note that `toHaveProperty` does NOT test objects by reference, but
instead checks if the object has a property with the specified key and value.
This means that it will pass as long as the object has a property with the
correct key and value, regardless of whether it is the same object reference or
not.
