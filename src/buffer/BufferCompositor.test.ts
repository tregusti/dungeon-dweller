import { BufferCompositor } from './BufferCompositor'
import { Buffer, BufferEntry } from './Buffer'

const size5x5 = { width: 5, height: 5 }

describe('BufferCompositor', () => {
  const getFlushedEntries = (compositor: BufferCompositor) => {
    const entries: BufferEntry[] = []
    compositor.flush((e) => entries.push(...e))
    return entries
  }
  it('should composite a single buffer', () => {
    const compositor = new BufferCompositor(size5x5)
    const buffer = compositor.add({
      buffer: new Buffer(size5x5),
      x: 0,
      y: 0,
      z: 0,
    })
    buffer.set(2, 2, 'A')

    const entries = getFlushedEntries(compositor)

    expect(entries).toBeInstanceOf(Array)
    expect(entries).toHaveLength(1)
    expect(entries.at(0)).toEqual({ x: 2, y: 2, char: 'A' })
  })
  it('should composite buffers based on z-index', () => {
    const compositor = new BufferCompositor(size5x5)
    const buffer1 = compositor.add({
      buffer: new Buffer(size5x5),
      x: 0,
      y: 0,
      z: 1,
    })
    const buffer2 = compositor.add({
      buffer: new Buffer(size5x5),
      x: 0,
      y: 0,
      z: 2,
    })
    buffer1.set(2, 2, 'A')
    buffer2.set(2, 2, 'B')

    const entries = getFlushedEntries(compositor)

    expect(entries).toBeInstanceOf(Array)
    expect(entries).toHaveLength(1)
    expect(entries.at(0)).toEqual({ x: 2, y: 2, char: 'B' })
  })
  it('should flush changed empty cells', () => {
    const compositor = new BufferCompositor(size5x5)
    const buffer = compositor.add({
      buffer: new Buffer(size5x5),
      x: 0,
      y: 0,
      z: 0,
    })

    buffer.set(2, 2, null)
    let entries = getFlushedEntries(compositor)
    expect(entries).toHaveLength(1)
    expect(entries.at(0)).toEqual({ x: 2, y: 2, char: null })

    entries = getFlushedEntries(compositor)
    expect(entries).toHaveLength(0)
  })
})
