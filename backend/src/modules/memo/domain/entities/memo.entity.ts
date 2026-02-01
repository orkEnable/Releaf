export class Memo {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly title: string,
    readonly content: string,
    readonly reviewCount: number,
    readonly lastReviewedAt: Date | null,
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
    return new Memo(id, userId, title, content, 0, null, null, null);
  }

  static from(
    id: string,
    userId: string,
    title: string,
    content: string,
    reviewCount: number,
    lastReviewedAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
  ): Memo {
    return new Memo(
      id,
      userId,
      title,
      content,
      reviewCount,
      lastReviewedAt,
      createdAt,
      updatedAt,
    );
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
      this.reviewCount,
      this.lastReviewedAt,
      this.createdAt,
      this.updatedAt,
    );
  }

  /**
   * 復習統計を更新する
   */
  recordReview(reviewedAt: Date): Memo {
    return new Memo(
      this.id,
      this.userId,
      this.title,
      this.content,
      this.reviewCount + 1,
      reviewedAt,
      this.createdAt,
      this.updatedAt,
    );
  }
}
