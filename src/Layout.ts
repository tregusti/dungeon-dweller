const gameWidth = 60
const dungeonViewportWidth = gameWidth
const dungeonViewportHeight = 20
const levelDefaultWidth = 500
const levelDefaultHeight = 500
const statusHeight = 3
const statusOffset = 1

export const Layout = {
  game: {
    size: {
      width: gameWidth,
      height: dungeonViewportHeight + statusHeight + statusOffset,
    },
  },
  dungeon: {
    coords: {
      x: 0,
      y: 0,
    },
    size: {
      width: dungeonViewportWidth,
      height: dungeonViewportHeight,
    },
    scrollMargin: {
      x: 10,
      y: 5,
    },
  },
  levels: {
    defaultSize: {
      width: levelDefaultWidth,
      height: levelDefaultHeight,
    },
  },
  status: {
    coords: {
      x: 0,
      y: dungeonViewportHeight + statusOffset,
    },
    size: {
      width: gameWidth,
      height: statusHeight,
    },
  },
} as const
