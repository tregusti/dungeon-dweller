# File structure

Files with a main class or type are named after that entity (PascalCase), and
files without a main class or type are named after their content (kebab-case).

No default exports. All exports are named.

Currently we are using commands and events as the main way to structure the
code.

# Terminology

- `spot` is a specific location in the dungeon, defined by its x and y
  coordinates, together with a level.
- `coords` is a location without a level, just x and y coordinates. A spot is a
  coords with a level.
- `level` is a specific floor in the dungeon, defined by its id. The level id is
  a string, which can be used to look up the level's layout and other
  properties.
- `dungeon` is the entire game world, which consists of multiple levels.

# Commands and events

Commands are organized as single files under `src/messaging/commands`, where
each command file contains the command type string, payload/result types, and
its handler class. For example, `MoveHero` is implemented in
`src/messaging/commands/MoveHeroCommand.ts`.

The interface `Commands` is defined in `src/messaging/core/Commands.ts` and is
augmented by all command definitions and is indexed by the type string for the
command. Refer to the add-command skill for instructions on how to add a new
command.

Events are defined directly in `src/messaging/core/Events.ts`. `Events` are
string-indexed and should stay alphabetically sorted as indicated by local
comments in that file.

# Testing

Generate as small test cases as possible, split up large tests into smaller
`describe('when ...', ...)` blocks, and avoid testing multiple scenarios in the
same test case. Each test case should ideally only test one thing.

Generally a test file resides next to the file it tests, with the same name and
an additional `.test` suffix. For example, `./MoveHeroCommand.ts` is tested by
`./MoveHeroCommand.test.ts`.
