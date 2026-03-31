import { Viewport } from './Viewport.js'

describe('Viewport', () => {
  const bounds = { width: 500, height: 500 }

  const createSUT = () => new Viewport(60, 20, { x: 10, y: 5 })

  it('does not scroll while the hero stays within the safe region', () => {
    const viewport = createSUT()

    viewport.update({ x: 49, y: 14 }, bounds)

    expect(viewport.origin).toEqual({ x: 0, y: 0 })
  })

  it('scrolls one tile when the hero steps beyond the right or bottom margin', () => {
    const viewport = createSUT()

    viewport.update({ x: 49, y: 14 }, bounds)
    viewport.update({ x: 50, y: 15 }, bounds)

    expect(viewport.origin).toEqual({ x: 1, y: 1 })
  })

  it('does not counter-scroll when the hero moves back toward the center', () => {
    const viewport = createSUT()

    viewport.update({ x: 51, y: 15 }, bounds)
    viewport.update({ x: 50, y: 14 }, bounds)

    expect(viewport.origin).toEqual({ x: 2, y: 1 })
  })

  it('clamps to the top-left level edge', () => {
    const viewport = createSUT()

    viewport.update({ x: 120, y: 70 }, bounds)
    viewport.update({ x: 0, y: 0 }, bounds)

    expect(viewport.origin).toEqual({ x: 0, y: 0 })
  })

  it('clamps to the bottom-right level edge', () => {
    const viewport = createSUT()

    viewport.update({ x: 499, y: 499 }, bounds)

    expect(viewport.origin).toEqual({ x: 440, y: 480 })
  })
})
