import { ReviewGrade } from '../value-objects/review-grade';

export class ReviewLog {
  private constructor(
    readonly id: string,
    readonly memoId: string,
    readonly reviewedAt: Date,
    readonly grade: ReviewGrade,
    readonly intervalDays: number | null,
  ) {}

  /**
   * 新しい復習ログを作成する
   */
  static create(
    id: string,
    memoId: string,
    grade: ReviewGrade,
    intervalDays: number | null = null,
    reviewedAt: Date = new Date(),
  ): ReviewLog {
    return new ReviewLog(id, memoId, reviewedAt, grade, intervalDays);
  }

  /**
   * 永続化されたデータから復元する
   */
  static from(
    id: string,
    memoId: string,
    reviewedAt: Date,
    grade: ReviewGrade,
    intervalDays: number | null,
  ): ReviewLog {
    return new ReviewLog(id, memoId, reviewedAt, grade, intervalDays);
  }
}
