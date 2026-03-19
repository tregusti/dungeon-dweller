# File structure

Files with a main class or type are named after that entity (PascalCase), and
files without a main class or type are named after their content (kebab-case).

No default exports. All exports are named.

Currently we are using commands and events as the main way to structure the
code.

# Terminology

`spot` is a specific location in the dungeon, defined by its x and y
coordinates. And in the future will probably also include a reference to the
level it is on.

# Commands and events

Commands are organized in folders under `src/messaging/commands` and events are
added more simple directly to the `src/messaging/core/Events.ts` file.
CommandType and EventType are defined in `src/messaging/core/Commands.ts` and
`src/messaging/core/Events.ts` respectively. They are indexed both by symbols.
Each command has a handler and optionally some services, which are all exported
from the command's index file. For example, the `MoveHero` command is
implemented in `src/messaging/commands/MoveHero` and has the following files:

```
src/messaging/commands/MoveHero/
  index.ts
  MoveHeroCommand.ts
  MoveHeroCommandHandler.ts
  MoveHeroCollisionService.ts
```

`MoveHeroCommand.ts` defines the command's payload and result types, and exports
them. `MoveHeroCommandHandler.ts` defines the command handler, which implements
the logic for executing the command. `MoveHeroCollisionService.ts` defines a
service that is used by the command handler to check for collisions when moving
the hero. `index.ts` exports all of these entities, so that they can be easily
imported from other parts of the codebase. When generating new commands, we can
use the `MoveHero` command as a template for the file structure and content.

# Testing

Generate as small test cases as possible, split up large tests into smaller
`describe('when ...', ...)` blocks, and avoid testing multiple scenarios in the
same test case. Each test case should ideally only test one thing.

Generally a test file resides next to the file it tests, with the same name and
an additional `.test` suffix. For example, `./MoveHeroCommandHandler.ts` is
tested by `./MoveHeroCommandHandler.test.ts`.
