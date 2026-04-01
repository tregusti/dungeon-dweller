import { Color, decolorize } from '../Color.js'
import { CanBeRendered, Cell, PickValues } from '../types.js'

export class Tile implements TileDefinition, CanBeRendered {
  static typeForChar(char: string): string {
    const def = TileDefinitions.find((def) => def.char === decolorize(char))
    if (!def) {
      throw new Error(`Unknown tile char: ${char}`)
    }
    return def.type
  }

  static create = (cell: Cell, type: string): Tile => {
    const def = TileDefinitions.find((def) => def.type === type)
    if (!def) {
      throw new Error(`Unknown tile type: ${type}`)
    }
    return new Tile(cell, def)
  }

  x: number
  y: number
  levelId: string
  char: string
  type: string
  color: Color
  description: string

  constructor(
    public cell: Cell,
    private definition: TileDefinition,
  ) {
    this.x = cell.x
    this.y = cell.y
    this.levelId = cell.levelId
    this.definition = definition
    this.char = definition.char
    this.type = definition.type
    this.color = definition.color
    this.description = definition.description
  }
}

// prettier-ignore
const list: TileDefinitionValues[] = [
// TABLE-START
//  char  type               color           description
  [' ',   'rock',            'white',        'An impassable rock. It looks solid and unyielding.'],
  ['┌',   'wall:down right', 'white',        'A stone wall.'],
  ['┐',   'wall:down left',  'red',          'A stone wall.'],
  ['┘',   'wall:up left',    'white',        'A stone wall.'],
  ['└',   'wall:up right',   'white',        'A stone wall.'],
  ['│',   'wall:up down',    'white',        'A stone wall.'],
  ['─',   'wall:left right', 'white',        'A stone wall.'],
  ['·',   'floor',           'white',        'A dusty stone floor.'],
  ['+',   'door:closed',     'red',          'A wooden door, currently closed.'],
  ['□',   'door:open',       'yellow',       'A wooden door, currently open.'],
  ['>',   'stairs:down',     'brightyellow', 'A staircase leading down to the next level.'],
  ['<',   'stairs:up',       'brightyellow', 'A staircase leading up to the previous level.'],
  ['~',   'water',           'blue',         'A shallow pool of water.'],
// TABLE-END
]

type TileDefinitionValues = PickValues<
  TileDefinition,
  ['char', 'type', 'color', 'description']
>

export type TileDefinition = {
  char: string
  type: string
  color: Color
  description: string
}

export const TileDefinitions: TileDefinition[] = list.map(
  ([char, type, color, description]) => ({
    char,
    type,
    color,
    description,
  }),
)

export const TileTypes = TileDefinitions.map((def) => def.type)
