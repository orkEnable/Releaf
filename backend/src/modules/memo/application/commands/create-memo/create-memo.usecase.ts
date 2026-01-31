import { MemoRepository } from 'src/modules/memo/domain/memo.repository';
import { Memo } from 'src/modules/memo/domain/entities/memo.entity';
import { CreateMemoCommand } from './create-memo.command';
import { ulid } from 'ulid';
import { ReviewPlanRepository } from 'src/modules/review/domain/review-plan.repository';
import { ReviewPlan } from 'src/modules/review/domain/entities/review-plan.entity';
import { SpacedRepetitionService } from 'src/modules/review/domain/services/spaced-repetition.service';
import { ReviewGrade } from 'src/modules/review/domain/value-objects/review-grade';

export class CreateMemoUseCase {
  constructor(
    private readonly memoRepository: MemoRepository,
    private readonly reviewPlanRepository: ReviewPlanRepository,
  ) {}

  async execute(command: CreateMemoCommand): Promise<void> {
    const memo = Memo.create(
      ulid(),
      command.userId,
      command.title,
      command.content,
    );

    await this.memoRepository.create(memo);

    // 初回の復習予定を作成（1日後）
    const now = new Date();
    const firstReview = SpacedRepetitionService.calculateNextReview(
      ReviewGrade.GOOD, // 初回は学習完了として扱う
      0,
      2.5,
      0,
      now,
    );

    const reviewPlan = ReviewPlan.create(
      ulid(),
      memo.id,
      firstReview.nextReviewDate,
    );

    await this.reviewPlanRepository.create(reviewPlan);
  }
}
