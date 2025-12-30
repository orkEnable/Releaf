export class UpdateMemoCommand {
  constructor(
    readonly memoId: string,
    readonly userId: string,
    readonly title: string,
    readonly content: string,
  ) {}
}
