---
name: add-event
description:
  'Add a new messaging event in dungeon-dweller by updating string-indexed
  EventType and Events maps, preserving alphabetical order, and wiring
  publisher/subscriber usage with focused tests. Use when introducing game
  notifications.'
argument-hint: 'What event should be added, and what payload should it carry?'
---

# Add Event

## When To Use

- You need a new domain notification for game state changes.
- A command or service should publish a new event.
- A renderer or workflow should subscribe to a new event.

## Architecture Rule

- Events are defined centrally in src/messaging/core/Events.ts.
- Do not create per-event files under src/messaging/events.
- Keep Events entries alphabetically sorted.

## Inputs

Collect these before editing:

- Event type in PascalCase, for example HeroHealed.
- Payload shape and referenced domain entities/types.
- Publisher location (which command/service emits it).
- Subscriber location (if any behavior should react to it).

## Procedure

1. Update src/messaging/core/Events.ts:

- Add Events mapped type entry with payload type, alphabetically.

2. Publish the event from the responsible command/service after state changes.
3. Add or update subscribers where behavior depends on the event.
4. Update tests near the publisher/subscriber code:

- Verify the event is published with the exact payload.
- Verify event-dependent behavior where relevant.

5. Run the full test suite before completion.

## Decision Points

- Event vs command:
- Use command for actions and flow control.
- Use event for notifications after actions complete.
- Payload design:
  - Include only data subscribers need.
  - Prefer existing domain types (Hero, Monster, Position, Spot) when
    appropriate.
- Publishing timing:
  - Publish after successful state mutation.
  - Do not publish success events for failed actions.

## Quality Checks

An event change is complete when all checks pass:

- New Events key exist in alphabetical order.
- Event payload type is explicit and stable.
- Publisher emits event at correct point in the workflow.
- Tests cover the publish behavior and payload shape.
- Full test suite passes.

## Common Mistakes

- Breaking alphabetical order in Events.ts.
- Using events to orchestrate command flow instead of notifications.
- Emitting event before state update or on failed outcomes.

## Quick Prompt Examples

- Add HeroHealed event with hero, amount, and at position; publish from
  HealHeroCommand and test payload.
- Add TrapTriggered event and publish only on successful trap activation.
- Add LevelEntered event and subscribe in renderer to refresh viewport state.
