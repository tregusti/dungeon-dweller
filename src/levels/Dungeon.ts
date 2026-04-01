import { Hero } from '../entities/Hero.js'
import { Monster } from '../entities/Monster.js'
import { MonsterCollection } from '../entities/MonsterCollection.js'
import { Tile } from '../entities/Tile.js'
import { CanBeRendered, Coords, Size } from '../types.js'
import { Level } from './Level.js'

type RenderableContentMap<TMap extends Record<string, CanBeRendered>> = TMap

type CellContentMap = RenderableContentMap<{
  hero: Hero
  monster: Monster
  tile: Tile
}>

type CellContentType = keyof CellContentMap

export type CellContent = {
  [K in CellContentType]: Readonly<
    Coords & {
      type: K
      content: CellContentMap[K]
    }
  >
}[CellContentType]

export class Dungeon {
  readonly width: number
  readonly height: number
  readonly levels: Level[] = []

  constructor(
    size: Size,
    private hero: Hero,
    private monsters: MonsterCollection,
    levels: Level[] = [],
  ) {
    this.width = size.width
    this.height = size.height
    this.levels = levels
  }

  at(x: number, y: number, levelId: string = this.hero.levelId): CellContent[] {
    const tileType = Tile.typeForChar(this.getLevel(levelId).at(x, y))
    const tile = Tile.create({ x, y, levelId }, tileType)
    const contents: CellContent[] = [{ type: 'tile', content: tile, x, y }]
    if (
      this.hero.levelId === levelId &&
      this.hero.x === x &&
      this.hero.y === y
    ) {
      contents.push({ type: 'hero', content: this.hero, x, y })
    }

    const monster = this.monsters
      .list({ levelId })
      .find((m) => m.x === x && m.y === y)
    if (monster) {
      contents.push({ type: 'monster', content: monster, x, y })
    }

    return contents
  }

  isOccupied(
    x: number,
    y: number,
    levelId: string = this.hero.levelId,
  ): boolean {
    return this.at(x, y, levelId).some((content) =>
      // TODO: This is a bit hacky, we should have a more explicit way to
      // determine if a cell is occupied. Maybe a BLOCKING flag for anything
      // that can go in the dungeon?
      ['hero', 'monster', 'rock', 'wall'].includes(content.type),
    )
  }

  isFree(x: number, y: number, levelId: string = this.hero.levelId): boolean {
    return !this.isOccupied(x, y, levelId)
  }

  getLevel(id: string): Level {
    const level = this.levels.find((l) => l.id === id)
    if (!level) throw new Error(`Level '${id}' not found`)
    return level
  }

  get currentLevel(): Level {
    return this.getLevel(this.hero.levelId)
  }

  getFreeCoords(levelId: string = this.hero.levelId): Coords[] {
    const level = this.getLevel(levelId)
    const freeCoords: Coords[] = []
    for (const coords of level.coords()) {
      if (this.isFree(coords.x, coords.y, levelId)) {
        freeCoords.push(coords)
      }
    }
    return freeCoords
  }
}
