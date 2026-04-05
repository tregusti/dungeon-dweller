import { Color, colorize } from '../Color.js'
import { CanBeRendered, Cell } from '../types.js'
import { CreatureDefinition } from './CreatureDefinitions.js'
import { Trait } from './Trait.js'

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
  traits: Trait

  protected _energy: number = 0
  get energy() {
    return this._energy
  }

  get value() {
    return colorize(this.char, this.color)
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
    this.traits = definition.traits
  }
}
