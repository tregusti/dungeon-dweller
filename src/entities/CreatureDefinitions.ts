import { Color, PickValues } from '../types'

// prettier-ignore
const list: CreatureDefinitionValues = [
// TABLE-START
//  char type               color         speed   description
  ['e', 'elf',             'brightgreen',    12, 'A graceful, pointy-eared creature with a love for nature and magic.'],
  ['d', 'dog',             'white',           9, 'A loyal, four-legged companion with a keen sense of smell.'],
  ['d', 'wolf',            'white',           9, 'A wild, four-legged predator with sharp teeth.'],
  ['d', 'dire wolf',       'brightwhite',     9, 'A larger, more aggressive version of a wolf.'],
  ['D', 'dragon',          'brightred',      15, 'A fearsome, fire-breathing creature with scales.'],
  ['g', 'gnome',           'magenta',        12, 'A small, bearded creature with a love for gems.'],
  ['G', 'goblin',          'green',          10, 'A small, green creature with sharp teeth.'],
  ['G', 'goblin king',     'brightgreen',    10, 'A powerful goblin with a crown of bones.'],
  ['G', 'goblin skeleton', 'white',           8, 'A reanimated goblin with a bony frame.'],
  ['h', 'human',           'white',          10, 'A common inhabitant of the dungeon.'],
  ['o', 'orc',             'red',            11, 'A savage, warlike creature with a love for battle.'],
  ['T', 'troll',           'green',          10, 'A large, brutish creature that lurks under bridges.'],
// TABLE-END
]

type CreatureDefinitionValues = PickValues<
  CreatureDefinition,
  ['char', 'type', 'color', 'speed', 'description']
>[]

export type CreatureDefinition = {
  char: string
  type: string
  color: Color
  speed: number
  description: string
}

export const CreatureDefinitions: CreatureDefinition[] = list.map(
  ([char, type, color, speed, description]) => ({
    char,
    type,
    color,
    speed,
    description,
  }),
)
export const CreatureTypes = CreatureDefinitions.map((def) => def.type)
