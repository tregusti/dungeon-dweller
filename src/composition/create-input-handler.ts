import { Debug } from '../Debug.js'
import { Hero } from '../entities/Hero.js'
import { Layout } from '../Layout.js'
import { CommandBus, Commands } from '../messaging/core/main.js'
import { ana, sentence } from '../utils/text.js'

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
      case 's':
        await handleLevelSwitch()
        break
      // actions
      case 'm':
        await handleCreateMonster()
        break
    }
  }

  async function handleLevelSwitch() {
    await commandBus.execute('SwitchLevel', {
      // TODO: This should of course not be hard coded later on.
      levelId: hero.levelId === '1' ? '2' : '1',
      to: {
        x: Math.floor(Layout.levels.defaultSize.width / 2),
        y: Math.floor(Layout.levels.defaultSize.height / 2),
      },
    })
    Debug.write(`Hero switches to level ${hero.levelId} at turn ${hero.turns}`)
    await handleMonsterRounds()
  }

  async function handleCreateMonster() {
    const result = await commandBus.execute('CreateMonster', {
      levelId: hero.levelId,
    })

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
        `You move to (${result.to.x},${result.to.y}) at turn ${hero.turns}.`,
      )
      await handleMonsterRounds()
    } else if (result.reason === 'blocked') {
      // monster is blocking the way
      if (result.type === 'monster') {
        await commandBus.execute('MeleeAttackCreature', {
          attacker: hero,
          target: result.content,
        })
        Debug.write(
          `You attack the ${result.content.type} at turn ${hero.turns}`,
        )
      }

      if (result.type === 'tile') {
        Debug.write(
          `You bump into ${ana(result.content.type)} at turn ${hero.turns}`,
        )
      }
    } else if (result.reason === 'outside') {
      Debug.write(`You can't move outside the level at turn ${hero.turns}`)
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
            `${sentence(ana(monster.type))} moves to (${monsterResult.to.x},${monsterResult.to.y}) at turn ${hero.turns}. Speed: ${monster.speed}, Energy: ${monster.energy}`,
          )
        } else if (
          monsterResult.reason === 'blocked' &&
          monsterResult.type === 'hero'
        ) {
          await commandBus.execute('MeleeAttackCreature', {
            attacker: monster,
            target: hero,
          })
        } else {
          Debug.write(
            `${sentence(ana(monster.type))} bumps into ${ana(monsterResult.reason)} at turn ${hero.turns}`,
          )
        }
      }
    }
  }
}
