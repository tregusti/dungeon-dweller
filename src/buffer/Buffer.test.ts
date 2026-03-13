import { Buffer } from './Buffer'

describe('Buffer', () => {
  it('should expose the size', () => {
    const buffer = new Buffer({ width: 10, height: 5 })
    expect(buffer.width).toBe(10)
    expect(buffer.height).toBe(5)
  })

  it('should allow to set and get cells', () => {
    const buffer = new Buffer({ width: 5, height: 5 })
    buffer.set(2, 2, 'A')
    expect(buffer.get(2, 2)).toBe('A')
  })

  describe('.entries', () => {
    it('should have no entries by default', () => {
      const buffer = new Buffer({ width: 10, height: 5 })
      expect(buffer.entries.length).toBe(0)
    })
    it('should return entries for changed cells', () => {
      const buffer = new Buffer({ width: 10, height: 5 })
      buffer.set(2, 3, 'A')
      buffer.set(3, 3, 'B')
      buffer.set(4, 3, 'C')
      expect(buffer.entries.length).toBe(3)
      expect(buffer.entries.map(({ char }) => char)).toEqual(['A', 'B', 'C'])
    })
    it('should return entries for non-null characters', () => {
      const buffer = new Buffer({ width: 10, height: 5 })
      buffer.set(2, 3, 'A')
      expect(buffer.entries.length).toBe(1)
      expect(buffer.entries[0]).toEqual({ x: 2, y: 3, char: 'A' })
    })

    describe('flushing', () => {
      it('should return entries for all changed cells', () => {
        const buffer = new Buffer({ width: 5, height: 5 })
        buffer.set(1, 1, null)
        expect(buffer.entries.length).toBe(1)
        expect(buffer.entries[0]).toEqual({ x: 1, y: 1, char: null })
      })
      it('should not return entries for empty cells after flushing', () => {
        const buffer = new Buffer({ width: 5, height: 5 })
        buffer.set(2, 2, null)
        buffer.markAsFlushed()
        expect(buffer.entries.length).toBe(0)
      })
    })
  })

  describe('.clear()', () => {
    it('should set all cells to null', () => {
      const buffer = new Buffer({ width: 5, height: 5 })
      buffer.set(2, 2, 'A')

      buffer.clear()

      for (let y = 0; y < buffer.height; y++) {
        for (let x = 0; x < buffer.width; x++) {
          expect(buffer.get(x, y)).toBeNull()
        }
      }
    })
    it('should mark all cells as changed', () => {
      const buffer = new Buffer({ width: 5, height: 5 })
      buffer.markAsFlushed()

      buffer.clear()

      expect(buffer.entries.length).toBe(25)
    })
  })

  describe('.clear(line)', () => {
    it('should set all cells of a line', () => {
      const buffer = new Buffer({ width: 5, height: 5 })
      buffer.text(0, 0, 'HELLO')

      buffer.clear(0)

      const chars = buffer.entries.map(({ char }) => char)
      expect(chars).toEqual([null, null, null, null, null])
    })
  })

  describe('.clear(x, y)', () => {
    it('should set a specific cell to null', () => {
      const buffer = new Buffer({ width: 5, height: 5 })
      buffer.text(0, 0, 'HELLO')

      buffer.clear(2, 0)

      const chars = buffer.entries.map(({ char }) => char)
      expect(chars).toEqual(['H', 'E', null, 'L', 'O'])
    })
  })

  describe('.text()', () => {
    it('should set a string of text', () => {
      const buffer = new Buffer({ width: 10, height: 5 })
      buffer.text(2, 3, 'Hello')
      expect(buffer.get(2, 3)).toBe('H')
      expect(buffer.get(3, 3)).toBe('e')
      expect(buffer.get(4, 3)).toBe('l')
      expect(buffer.get(5, 3)).toBe('l')
      expect(buffer.get(6, 3)).toBe('o')
    })
  })
  describe('.line()', () => {
    it('should set a line of text', () => {
      const buffer = new Buffer({ width: 10, height: 5 })
      buffer.line(3, 'Hello')
      expect(buffer.get(0, 3)).toBe('H')
      expect(buffer.get(1, 3)).toBe('e')
      expect(buffer.get(2, 3)).toBe('l')
      expect(buffer.get(3, 3)).toBe('l')
      expect(buffer.get(4, 3)).toBe('o')
    })
    it('should pad text to the end of the line', () => {
      const buffer = new Buffer({ width: 5, height: 5 })
      buffer.line(3, 'Hi')
      expect(buffer.get(0, 3)).toBe('H')
      expect(buffer.get(1, 3)).toBe('i')
      expect(buffer.get(2, 3)).toBe(' ')
      expect(buffer.get(3, 3)).toBe(' ')
      expect(buffer.get(4, 3)).toBe(' ')
    })
  })

  describe('.debug', () => {
    it('should return a string representation of the buffer', () => {
      const buffer = new Buffer({ width: 3, height: 2 })
      buffer.set(0, 0, 'A')
      buffer.set(1, 0, 'B')
      buffer.set(2, 0, 'C')
      buffer.set(0, 1, null)
      buffer.set(1, 1, null)
      buffer.set(2, 1, null)
      expect(buffer.debug).toBe('3x2: ABC\n   ')
      buffer.markAsFlushed()
      buffer.set(0, 0, null)
      expect(buffer.debug).toBe('3x2:  BC\n···')
    })
  })
})
