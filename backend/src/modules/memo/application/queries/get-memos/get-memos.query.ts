export class GetMemosQuery {
  constructor(
    readonly userId: string,
    readonly limit?: number,
    readonly offset?: number,
  ) {}
}
