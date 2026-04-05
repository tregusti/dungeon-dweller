import { Color } from '../Color.js'
import { PickValues } from '../types.js'
import { Trait } from './Trait.js'

// prettier-ignore
const list: CreatureDefinitionValues[] = [
// TABLE-START
//  char type               color         speed traits           description
  ['e', 'elf',             'brightgreen',   12, Trait.Blocking, 'A graceful, pointy-eared creature with a love for nature and magic.'],
  ['d', 'dog',             'white',          9, Trait.Blocking, 'A loyal, four-legged companion with a keen sense of smell.'],
  ['d', 'wolf',            'gray',           9, Trait.Blocking, 'A wild, four-legged predator with sharp teeth.'],
  ['d', 'dire wolf',       'cyan',           9, Trait.Blocking, 'A larger, more aggressive version of a wolf.'],
  ['D', 'dragon',          'brightred',     15, Trait.Blocking, 'A fearsome, fire-breathing creature with scales.'],
  ['g', 'gnome',           'magenta',       12, Trait.Blocking, 'A small, bearded creature with a love for gems.'],
  ['G', 'goblin',          'green',         10, Trait.Blocking, 'A small, green creature with sharp teeth.'],
  ['G', 'goblin king',     'brightgreen',   10, Trait.Blocking, 'A powerful goblin with a crown of bones.'],
  ['G', 'goblin skeleton', 'white',          8, Trait.Blocking, 'A reanimated goblin with a bony frame.'],
  ['h', 'human',           'yellow',        10, Trait.Blocking, 'A common inhabitant of the dungeon.'],
  ['o', 'orc',             'red',           11, Trait.Blocking, 'A savage, warlike creature with a love for battle.'],
  ['T', 'troll',           'green',         10, Trait.Blocking, 'A large, brutish creature that lurks under bridges.'],
// TABLE-END
]

type CreatureDefinitionValues = PickValues<
  CreatureDefinition,
  ['char', 'type', 'color', 'speed', 'traits', 'description']
>

export type CreatureDefinition = {
  char: string
  type: string
  color: Color
  speed: number
  description: string
  traits: Trait
}

export const CreatureDefinitions: CreatureDefinition[] = list.map(
  ([char, type, color, speed, traits, description]) => ({
    char,
    type,
    color,
    speed,
    traits,
    description,
  }),
)

export const CreatureTypes = CreatureDefinitions.map((def) => def.type)
