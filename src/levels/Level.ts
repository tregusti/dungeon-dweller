export class Level {
  constructor(
    public readonly id: string,
    private readonly layout: string[][],
  ) {}

  get width(): number {
    return this.layout[0]?.length ?? 0
  }

  get height(): number {
    return this.layout.length
  }

  at(x: number, y: number): string {
    return this.layout[y][x]
  }
}
