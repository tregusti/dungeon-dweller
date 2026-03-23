const dungeonWidth = 20
const dungeonHeight = 10
const statusHeight = 3
const statusOffset = 1

export const Layout = {
  game: {
    size: {
      width: dungeonWidth,
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
      width: dungeonWidth,
      height: statusHeight,
    },
  },
} as const
