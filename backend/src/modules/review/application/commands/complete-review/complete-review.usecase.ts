import { ulid } from 'ulid';
import { CompleteReviewCommand } from './complete-review.command';
import { PrismaReviewPlanRepository } from 'src/modules/review/infra/prisma-review-plan.repository';
import { PrismaReviewLogRepository } from 'src/modules/review/infra/prisma-review-log.repository';
import { PrismaMemoRepository } from 'src/modules/memo/infra/prisma-memo.repository';
import { ReviewLog } from 'src/modules/review/domain/entities/review-log.entity';
import { ReviewPlan } from 'src/modules/review/domain/entities/review-plan.entity';
import { SpacedRepetitionService } from 'src/modules/review/domain/services/spaced-repetition.service';
import { UnitOfWork } from 'src/modules/common/infra/unit-of-work';

export class CompleteReviewUseCase {
  constructor(
    private readonly reviewPlanRepository: PrismaReviewPlanRepository,
    private readonly reviewLogRepository: PrismaReviewLogRepository,
    private readonly memoRepository: PrismaMemoRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async execute(command: CompleteReviewCommand): Promise<void> {
    const now = new Date();

    // 1. 現在のReviewPlanを取得
    const currentPlan = await this.reviewPlanRepository.findById(
      command.reviewPlanId,
    );
    if (!currentPlan) {
      throw new Error('復習計画が見つかりません');
    }

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

    // エンティティを事前に作成
    const completedPlan = currentPlan.complete(now);
    const reviewLog = ReviewLog.create(
      ulid(),
      command.memoId,
      command.grade,
      nextReview.intervalDays,
      now,
    );
    const nextPlan = ReviewPlan.create(
      ulid(),
      command.memoId,
      nextReview.nextReviewDate,
    );

    // トランザクション内で全ての更新を実行
    await this.unitOfWork.run(async (tx) => {
      // 4. 現在の計画を完了にする
      await this.reviewPlanRepository.updateTx(tx, completedPlan);
      // 5. 復習ログを記録
      await this.reviewLogRepository.createTx(tx, reviewLog);
      // 6. 次の復習計画を作成
      await this.reviewPlanRepository.createTx(tx, nextPlan);
      // 7. メモの復習統計を更新
      await this.memoRepository.incrementReviewCountTx(tx, command.memoId, now);
    });
  }
}
