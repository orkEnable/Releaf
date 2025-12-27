export class Memo {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly title: string,
    readonly content: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(
    id: string,
    userId: string,
    title: string,
    content: string,
    createdAt: Date,
    updatedAt: Date,
  ): Memo {
    return new Memo(id, userId, title, content, createdAt, updatedAt);
  }
}
