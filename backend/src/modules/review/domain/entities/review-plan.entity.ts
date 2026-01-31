import { ReviewPlanStatus } from '../value-objects/review-plan-status';

export class ReviewPlan {
  private constructor(
    readonly id: string,
    readonly memoId: string,
    readonly scheduledAt: Date,
    readonly status: ReviewPlanStatus,
    readonly doneAt: Date | null,
    readonly createdAt: Date | null,
    readonly updatedAt: Date | null,
  ) {}

  /**
   * 新しい復習計画を作成する
   */
  static create(id: string, memoId: string, scheduledAt: Date): ReviewPlan {
    return new ReviewPlan(
      id,
      memoId,
      scheduledAt,
      ReviewPlanStatus.PENDING,
      null,
      null,
      null,
    );
  }

  /**
   * 永続化されたデータから復元する
   */
  static from(
    id: string,
    memoId: string,
    scheduledAt: Date,
    status: ReviewPlanStatus,
    doneAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
  ): ReviewPlan {
    return new ReviewPlan(
      id,
      memoId,
      scheduledAt,
      status,
      doneAt,
      createdAt,
      updatedAt,
    );
  }

  /**
   * 復習を完了としてマークする
   */
  complete(doneAt: Date = new Date()): ReviewPlan {
    if (this.status !== ReviewPlanStatus.PENDING) {
      throw new Error('復習計画は既に完了またはスキップされています');
    }
    return new ReviewPlan(
      this.id,
      this.memoId,
      this.scheduledAt,
      ReviewPlanStatus.DONE,
      doneAt,
      this.createdAt,
      this.updatedAt,
    );
  }

  /**
   * 復習をスキップする
   */
  skip(): ReviewPlan {
    if (this.status !== ReviewPlanStatus.PENDING) {
      throw new Error('復習計画は既に完了またはスキップされています');
    }
    return new ReviewPlan(
      this.id,
      this.memoId,
      this.scheduledAt,
      ReviewPlanStatus.SKIPPED,
      null,
      this.createdAt,
      this.updatedAt,
    );
  }

  /**
   * 予定日を過ぎているかどうか
   */
  isOverdue(now: Date = new Date()): boolean {
    return this.status === ReviewPlanStatus.PENDING && this.scheduledAt < now;
  }

  /**
   * 今日が復習予定日かどうか
   */
  isDueToday(now: Date = new Date()): boolean {
    if (this.status !== ReviewPlanStatus.PENDING) return false;

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.scheduledAt >= today && this.scheduledAt < tomorrow;
  }
}
