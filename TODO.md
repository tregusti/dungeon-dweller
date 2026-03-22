# TODO

## Generic

- Add CompleteHeroTurn command and HeroTurnCompleted event to track energy gain
  end turn counter. And subscribe to it in StatusRenderer.
- Remove hard coded ctor values in Game.

## BufferCompositor

- Fix bug in BufferCompositor. Now it's not buffered, it renders everything the
  whole time.
- Verify that the buffer is not placed so its boundaries are outside the game
  view.
