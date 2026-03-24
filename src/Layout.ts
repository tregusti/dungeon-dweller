const gameWidth = 60
const dungeonWidth = gameWidth
const dungeonHeight = 20
const statusHeight = 3
const statusOffset = 1

export const Layout = {
  game: {
    size: {
      width: gameWidth,
      height: dungeonHeight + statusHeight + statusOffset,
    },
  },
  dungeon: {
    position: {
      x: 0,
      y: 0,
    },
    size: {
      width: dungeonWidth,
      height: dungeonHeight,
    },
  },
  status: {
    position: {
      x: 0,
      y: dungeonHeight + statusOffset,
    },
    size: {
      width: gameWidth,
      height: statusHeight,
    },
  },
} as const
