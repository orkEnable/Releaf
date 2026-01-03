export class DeleteMemoCommand {
  constructor(
    readonly userId: string,
    readonly memoId: string,
  ) {}
}
