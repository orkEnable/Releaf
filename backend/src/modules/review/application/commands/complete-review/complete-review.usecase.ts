import { ulid } from 'ulid';
import { CompleteReviewCommand } from './complete-review.command';
import { ReviewPlanRepository } from 'src/modules/review/domain/review-plan.repository';
import { ReviewLogRepository } from 'src/modules/review/domain/review-log.repository';
import { MemoRepository } from 'src/modules/memo/domain/memo.repository';
import { ReviewLog } from 'src/modules/review/domain/entities/review-log.entity';
import { ReviewPlan } from 'src/modules/review/domain/entities/review-plan.entity';
import { SpacedRepetitionService } from 'src/modules/review/domain/services/spaced-repetition.service';

export class CompleteReviewUseCase {
  constructor(
    private readonly reviewPlanRepository: ReviewPlanRepository,
    private readonly reviewLogRepository: ReviewLogRepository,
    private readonly memoRepository: MemoRepository,
  ) {}

  async execute(command: CompleteReviewCommand): Promise<void> {
    const now = new Date();

    // 1. 現在のReviewPlanを取得して完了にする
    const currentPlan = await this.reviewPlanRepository.findById(
      command.reviewPlanId,
    );
    if (!currentPlan) {
      throw new Error('復習計画が見つかりません');
    }

    const completedPlan = currentPlan.complete(now);
    await this.reviewPlanRepository.update(completedPlan);

    // 2. 過去の復習履歴を取得
    const histories = await this.reviewLogRepository.findByMemoId(
      command.memoId,
    );

    // 3. 次の復習タイミングを計算
    const reviewHistories = histories.map((h) => ({
      reviewedAt: h.reviewedAt,
      grade: h.grade,
      intervalDays: h.intervalDays ?? 0,
    }));

    const nextReview = SpacedRepetitionService.calculateFromHistory(
      reviewHistories,
      command.grade,
      now,
    );

    // 4. 復習ログを記録
    const reviewLog = ReviewLog.create(
      ulid(),
      command.memoId,
      command.grade,
      nextReview.intervalDays,
      now,
    );
    await this.reviewLogRepository.create(reviewLog);

    // 5. 次の復習計画を作成
    const nextPlan = ReviewPlan.create(
      ulid(),
      command.memoId,
      nextReview.nextReviewDate,
    );
    await this.reviewPlanRepository.create(nextPlan);

    // 6. メモの復習統計を更新
    await this.memoRepository.incrementReviewCount(command.memoId, now);
  }
}
