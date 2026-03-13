import { BufferCompositor } from './BufferCompositor'
import { Buffer, BufferEntry } from './Buffer'

describe('BufferCompositor', () => {
  const getFlushedEntries = (compositor: BufferCompositor) => {
    const entries: BufferEntry[] = []
    compositor.flush((e) => entries.push(...e))
    return entries
  }
  it('should composite a single buffer', () => {
    const compositor = new BufferCompositor(5, 5)
    const buffer = compositor.add(BufferBuilder.create().build())
    buffer.set(2, 2, 'A')

    const entries = getFlushedEntries(compositor)

    expect(entries).toBeInstanceOf(Array)
    expect(entries).toHaveLength(1)
    expect(entries.at(0)).toEqual({ x: 2, y: 2, char: 'A' })
  })
  it('should composite buffers based on z-index', () => {
    const compositor = new BufferCompositor(5, 5)
    const buffer1 = BufferBuilder.create().withZIndex(1).build()
    const buffer2 = BufferBuilder.create().withZIndex(2).build()
    buffer1.set(2, 2, 'A')
    buffer2.set(2, 2, 'B')
    compositor.add(buffer1)
    compositor.add(buffer2)

    const entries = getFlushedEntries(compositor)

    expect(entries).toBeInstanceOf(Array)
    expect(entries).toHaveLength(1)
    expect(entries.at(0)).toEqual({ x: 2, y: 2, char: 'B' })
  })
  it('should flush changed empty cells', () => {
    const compositor = new BufferCompositor(5, 5)
    const buffer = compositor.add(BufferBuilder.create().build())

    buffer.set(2, 2, null)
    let entries = getFlushedEntries(compositor)
    expect(entries).toHaveLength(1)
    expect(entries.at(0)).toEqual({ x: 2, y: 2, char: null })

    entries = getFlushedEntries(compositor)
    expect(entries).toHaveLength(0)
  })
})

class BufferBuilder {
  static create() {
    return new BufferBuilder()
  }

  private width: number = 5
  private height: number = 5
  private x: number = 0
  private y: number = 0
  private z: number = 0

  private constructor() {}

  withSize(width: number, height: number) {
    this.width = width
    this.height = height
    return this
  }

  withPosition(x: number, y: number) {
    this.x = x
    this.y = y
    return this
  }

  withZIndex(z: number) {
    this.z = z
    return this
  }

  build() {
    return new Buffer({
      width: this.width,
      height: this.height,
      x: this.x,
      y: this.y,
      z: this.z,
    })
  }
}
