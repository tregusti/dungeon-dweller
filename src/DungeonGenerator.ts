import seedrandom from 'seedrandom'

/// https://gemini.google.com/share/49c3dda200ae

// Is this good? Or too complex? Maybe just have generator functions that
// create the new prngs as needed? Without classes.

class SeededGenerator {
  protected prng: seedrandom.PRNG

  constructor(seed: string) {
    this.prng = seedrandom(seed)
    this.prng() // Discard the first value, which might be less random
  }
}

class HeroGenerator extends SeededGenerator {
  constructor(seed: string) {
    super(seed)
  }
}

class GameGenerator extends SeededGenerator {
  private heroGen: HeroGenerator
  private dungeonGen: DungeonGenerator
  constructor(seed: string) {
    super(seed)
    this.heroGen = new HeroGenerator(seed + ' hero')
    this.dungeonGen = new DungeonGenerator(seed + ' dungeon')
  }
}

export class DungeonGenerator extends SeededGenerator {
  private levelGen: LevelGenerator
  constructor(seed: string) {
    super(seed)
    // Or maybe create this in generate for each level?
    this.levelGen = new LevelGenerator(seed + ' level')
  }

  generate(width: number, height: number, iterations: number) {
    const root = { x: 0, y: 0, w: width, h: height }
    const leaves = [root]

    for (let i = 0; i < iterations; i++) {
      const leaf = leaves.shift()!
      // Slumpa om vi delar horisontellt eller vertikalt
      const splitH = this.prng() > 0.5

      // Dela rektangeln (här behövs logik för att inte dela för smått)
      const splitPos = 0.4 + this.rng() * 0.2 // Dela nånstans i mitten (40-60%)

      // Skapa två nya "löv" och pusha till listan...
      // Efter alla iterationer ritar du ett rum i varje slutgiltigt "löv".
    }
  }
}

class LevelGenerator extends SeededGenerator {
  generate(width: number, height: number) {
    // Skapa en 2D-array av tiles (väggar)
    // Använd t.ex. cellular automata för att skapa grottor
    // Eller dela upp i rum och koppla ihop med korridorer
  }
}
