import { Debug } from '../Debug'
import { Hero } from '../entities/Hero'
import { CommandBus, Commands } from '../messaging/core'

type CreateInputHandlerArgs = {
  commandBus: CommandBus<Commands>
  hero: Hero
  exitGame: () => void
}

export function createInputHandler({
  commandBus,
  hero,
  exitGame,
}: CreateInputHandlerArgs) {
  return async function onInput(chunk: string) {
    if (chunk === '\u0003' || chunk === 'q') {
      // ctrl-c
      exitGame()
    }

    switch (chunk) {
      // movement keys
      case 'h':
        await handleMovement(-1, 0)
        break
      case 'l':
        await handleMovement(1, 0)
        break
      case 'k':
        await handleMovement(0, -1)
        break
      case 'j':
        await handleMovement(0, 1)
        break
      // actions
      case 'm':
        await handleCreateMonster()
        break
    }
  }

  async function handleCreateMonster() {
    const result = await commandBus.execute('CreateMonster')

    if (!result.success) {
      Debug.write(`No free dungeon tile to spawn monster at turn ${hero.turns}`)
      return
    }
  }

  async function handleMovement(dx: number, dy: number) {
    const result = await commandBus.execute('MoveHero', {
      dx,
      dy,
    })

    if (result.success) {
      Debug.write(
        `Hero moves to (${result.to.x},${result.to.y}) at turn ${hero.turns}.`,
      )
      await handleMonsterRounds()
    } else if (result.reason === 'wall') {
      Debug.write(`Hero bumps into a wall at turn ${hero.turns}`)
    } else if (result.reason === 'monster') {
      await commandBus.execute('MeleeAttackCreature', {
        attacker: hero,
        target: result.monster,
      })
      Debug.write(`Hero attacks ${result.monster.char} at turn ${hero.turns}`)
    }
  }

  async function handleMonsterRounds() {
    const turnResult = await commandBus.execute('ProcessUntilHeroReady')

    for (const round of turnResult.rounds) {
      for (const action of round.actions) {
        const monster = action.monster
        const monsterResult = action.result

        if (monsterResult.success) {
          Debug.write(
            `${monster.char} moves to (${monsterResult.to.x},${monsterResult.to.y}) at turn ${hero.turns}. Speed: ${monster.speed}, Energy: ${monster.energy}`,
          )
        } else if (monsterResult.reason === 'hero') {
          await commandBus.execute('MeleeAttackCreature', {
            attacker: monster,
            target: hero,
          })
        } else {
          Debug.write(
            `${monster.char} bumps into a ${monsterResult.reason} at turn ${hero.turns}`,
          )
        }
      }
    }
  }
}
