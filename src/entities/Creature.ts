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

  protected _x: number
  public get x(): number {
    return this._x
  }

  protected _y: number
  public get y(): number {
    return this._y
  }

  protected _levelId: string
  public get levelId(): string {
    return this._levelId
  }

  protected _char: string
  public get char(): string {
    return this._char
  }

  protected _speed: number
  public get speed(): number {
    return this._speed
  }

  protected _type: string
  public get type(): string {
    return this._type
  }

  protected _color: Color
  public get color(): Color {
    return this._color
  }
  protected _description: string
  public get description(): string {
    return this._description
  }

  protected _name: string | undefined
  /** A specific name for this creature instance. E.g. "Sir Lancelot" */
  public get name(): string | undefined {
    return this._name
  }

  protected _traits: Trait
  public get traits(): Trait {
    return this._traits
  }

  protected _energy: number = 0
  get energy() {
    return this._energy
  }

  get value() {
    return colorize(this.char, this.color)
  }

  constructor({ x, y, levelId, definition, name }: CreatureProps) {
    this._x = x
    this._y = y
    this._levelId = levelId
    this._name = name
    this.definition = definition

    // From definition
    this._char = definition.char
    this._speed = definition.speed
    this._type = definition.type
    this._color = definition.color
    this._description = definition.description
    this._traits = definition.traits
  }
}
