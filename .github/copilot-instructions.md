# File structure

Files with a main class or type are named after that entity (PascalCase), and
files without a main class or type are named after their content (kebab-case).

No default exports. All exports are named.

Currently we are using commands and events as the main way to structure the
code.

# Testing

Generate as small test cases as possible, split up large tests into smaller
`describe('when ...', ...)` blocks, and avoid testing multiple scenarios in the
same test case. Each test case should ideally only test one thing.

Generally a test file resides next to the file it tests, with the same name and
an additional `.test` suffix. For example, `./MoveHeroCommandHandler.ts` is
tested by `./MoveHeroCommandHandler.test.ts`.
