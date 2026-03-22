const dungeonWidth = 20
const dungeonHeight = 10
const statusHeight = 3

export const Layout = {
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
      y: dungeonHeight + 1,
    },
    size: {
      width: dungeonWidth,
      height: statusHeight,
    },
  },
} as const
