export class Level {
  constructor(
    public readonly id: string,
    private readonly layout: string[][],
  ) {}

  at(x: number, y: number): string {
    return this.layout[y][x]
  }
}
