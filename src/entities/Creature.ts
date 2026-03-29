import { Color } from '../Color'
import { CanBeRendered, Cell } from '../types'
import { CreatureDefinition } from './CreatureDefinitions'

export type NamedCreature = {
  name?: string
}
export type CreatureProps = Cell &
  NamedCreature & {
    definition: CreatureDefinition
  }

export abstract class Creature
  implements CreatureDefinition, Cell, NamedCreature, CanBeRendered
{
  private definition: CreatureDefinition
  x: number
  y: number
  levelId: string
  char: string
  speed: number
  type: string
  color: Color
  description: string
  /** A specific name for this creature instance. E.g. "Sir Lancelot" */
  name?: string

  protected _energy: number = 0

  get energy() {
    return this._energy
  }

  constructor({ x, y, levelId, definition, name }: CreatureProps) {
    this.x = x
    this.y = y
    this.levelId = levelId
    this.name = name
    this.definition = definition

    // From definition
    this.char = definition.char
    this.speed = definition.speed
    this.type = definition.type
    this.color = definition.color
    this.description = definition.description
  }
}
