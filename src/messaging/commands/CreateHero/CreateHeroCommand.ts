import { Hero } from '../../../entities/Hero'

export const CreateHeroCommandType = Symbol('CreateHero')

export type CreateHeroCommandPayload = void

export type CreateHeroCommandResult = {
  success: true
  hero: Hero
}
