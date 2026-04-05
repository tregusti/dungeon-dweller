import { Color, colorize, decolorize } from '../Color.js'
import { CanBeRendered, Cell, PickValues } from '../types.js'
import { Trait } from './Trait.js'

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
  traits: Trait

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
    this.traits = definition.traits
  }
  get value() {
    return colorize(this.char, this.color)
  }
}

// prettier-ignore
const list: TileDefinitionValues[] = [
// TABLE-START
//  char  type               color           traits            description
  [' ',   'rock',            'white',        Trait.Blocking, 'An impassable rock. It looks solid and unyielding.'],
  ['┌',   'wall:down right', 'white',        Trait.Blocking, 'A stone wall.'],
  ['┐',   'wall:down left',  'red',          Trait.Blocking, 'A stone wall.'],
  ['┘',   'wall:up left',    'white',        Trait.Blocking, 'A stone wall.'],
  ['└',   'wall:up right',   'white',        Trait.Blocking, 'A stone wall.'],
  ['│',   'wall:up down',    'white',        Trait.Blocking, 'A stone wall.'],
  ['─',   'wall:left right', 'white',        Trait.Blocking, 'A stone wall.'],
  ['+',   'door:closed',     'red',          Trait.Blocking, 'A wooden door, currently closed.'],
  ['□',   'door:open',       'yellow',       Trait.None,     'A wooden door, currently open.'],
  ['·',   'floor',           'white',        Trait.None,     'A dusty stone floor.'],
  ['>',   'stairs:down',     'brightyellow', Trait.None,     'A staircase leading down to the next level.'],
  ['<',   'stairs:up',       'brightyellow', Trait.None,     'A staircase leading up to the previous level.'],
  ['~',   'water',           'blue',         Trait.Blocking, 'A shallow pool of water.'],
// TABLE-END
]

// All tile chars MUST be unique, otherwise we can't reliably determine the type
// from the char when parsing the level layout files. So we validate.
const chars = list.map(([char]) => char)
if (new Set(chars).size !== chars.length) {
  throw new Error('Duplicate tile chars found in tile definitions')
}

type TileDefinitionValues = PickValues<
  TileDefinition,
  ['char', 'type', 'color', 'traits', 'description']
>

export type TileDefinition = {
  char: string
  type: string
  color: Color
  traits: Trait
  description: string
}

export const TileDefinitions: TileDefinition[] = list.map(
  ([char, type, color, traits, description]) => ({
    char,
    type,
    color,
    traits,
    description,
  }),
)

export const TileTypes = TileDefinitions.map((def) => def.type)
