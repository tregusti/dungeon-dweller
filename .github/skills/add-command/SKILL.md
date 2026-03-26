---
name: add-command
description:
  'Add a new messaging command in dungeon-dweller with payload/result typing,
  handler implementation, command registration, and focused tests. Use when
  creating gameplay actions, orchestration commands, or command-driven world
  updates.'
argument-hint:
  'What command should be added, and what payload/result should it use?'
---

# Add Command

## When To Use

- You need a new command in src/messaging/commands.
- You are adding a new gameplay action that should run through CommandBus.
- You need an orchestration command that coordinates other commands.

## Architecture Rule

- Enforce single-file command modules.
- Do not create per-command folders, index files, or separate handler files.
- Keep command symbol, payload/result types, and handler class in one file:
  src/messaging/commands/<CommandName>Command.ts.

## Inputs

Collect these before editing:

- Command name in PascalCase, for example HealHero.
- Whether the command has payload or uses void payload.
- Result union shape (success and failure branches).
- Dependencies needed by handler (entities, services, buses, random).
- Whether the command should publish events.

## Procedure

1. Create command module file in src/messaging/commands named
   <CommandName>Command.ts.
2. In the module, export:

- <CommandName>CommandPayload type.
- <CommandName>CommandResult type.
- <CommandName>CommandHandler class with a handle method.

3. Implement handler logic in small steps and keep side effects explicit:

- Read required state from constructor-injected dependencies.
- Execute domain update.
- Publish events if needed.
- Return a fully typed result.

4. Augment Commands interface in src/messaging/core/Commands.ts:

- Add an entry for the new command type, mapping payload and result types. For
  example, for HealHeroCommand:

```typescript
declare module '../core/Commands' {
  interface Commands {
    HealHero: CommandDef<HealHeroCommandPayload, HealHeroCommandResult>
  }
}
```

5. Register handler in src/composition/register-command-handlers.ts:

- Import handler class.
- Construct handler with injected dependencies.
- Register with commandBus.register("<CommandName>", ...).

6. If command is invoked by input flow or orchestration, wire call sites that
   execute it.
7. Create tests in src/messaging/commands/<CommandName>Command.test.ts:

- One scenario per test.
- Split behavior using describe('when ...') or describe('with ...').
- Verify state change, emitted events, and returned result shape.

8. Run the full test suite before considering the task complete.

## Decision Points

- Payload or no payload:
- Use payload type void for no-input commands.
- For void payload, execute command as `execute("CommandType")` with zero args.
- For payload commands, execute as `execute("CommandType", payload)`.
- Orchestration or atomic command:
  - Atomic commands perform one domain action.
  - Orchestration commands call atomic commands via CommandBus and manage flow.
- Event emission:
  - Publish events for notifications after state changes.
  - Keep flow control command-driven, not event-driven.

## Quality Checks

A command is complete when all checks pass:

- Types compile with no missing Commands map entry.
- Handler is registered in register-command-handlers composition function.
- Payload usage matches CommandBus execute signature rules.
- Tests cover success and each failure branch.
- Tests are minimal, isolated, and follow describe('when/with ...') style.

## Common Mistakes

- Registering command type without constructing handler dependencies.
- Mixing event orchestration with command orchestration.
- Creating multi-file command folders instead of the required single-file
  module.
- Writing a single test that asserts multiple unrelated scenarios.

## Quick Prompt Examples

- Add a new command named HealHero with payload amount and levelId, including
  handler, registration, and tests.
- Add a no-payload command named ProcessTrapsRound and wire it as orchestration
  through CommandBus.
- Add a command named PickUpItem that publishes an event when successful and
  returns a discriminated result union.
