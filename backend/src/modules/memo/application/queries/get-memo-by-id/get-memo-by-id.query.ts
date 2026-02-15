export class GetMemoByIdQuery {
  constructor(
    readonly memoId: string,
    readonly userId: string,
  ) {}
}
