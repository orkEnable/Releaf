export class Memo {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly title: string,
    readonly content: string,
    readonly createdAt: Date | null,
    readonly updatedAt: Date | null,
  ) {}

  static create(
    id: string,
    userId: string,
    title: string,
    content: string,
  ): Memo {
    if (!title || title.trim().length === 0) {
      throw new Error('タイトルは必須です');
    }
    return new Memo(id, userId, title, content, null, null);
  }

  static from(
    id: string,
    userId: string,
    title: string,
    content: string,
    createdAt: Date,
    updatedAt: Date,
  ): Memo {
    return new Memo(id, userId, title, content, createdAt, updatedAt);
  }

  update(title: string, content: string): Memo {
    if (!title || title.trim().length === 0) {
      throw new Error('タイトルは必須です');
    }
    return new Memo(
      this.id,
      this.userId,
      title,
      content,
      this.createdAt,
      this.updatedAt,
    );
  }
}
