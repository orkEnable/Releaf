export class CreateMemoCommand {
  constructor(
    readonly userId: string,
    readonly title: string,
    readonly content: string,
  ) {}
}
