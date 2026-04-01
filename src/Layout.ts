const gameWidth = 60
const viewportWidth = gameWidth
const viewportHeight = 20
const statusHeight = 3
const statusOffset = 1

export const Layout = {
  game: {
    size: {
      width: gameWidth,
      height: viewportHeight + statusHeight + statusOffset,
    },
  },
  dungeon: {
    coords: {
      x: 0,
      y: 0,
    },
    size: {
      width: viewportWidth,
      height: viewportHeight,
    },
    scrollMargin: {
      x: 10,
      y: 5,
    },
  },
  levels: {
    defaultSize: {
      width: 60,
      height: 20,
    },
  },
  status: {
    coords: {
      x: 0,
      y: viewportHeight + statusOffset,
    },
    size: {
      width: gameWidth,
      height: statusHeight,
    },
  },
} as const
