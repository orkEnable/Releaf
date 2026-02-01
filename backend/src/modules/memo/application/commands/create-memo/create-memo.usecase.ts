import { Memo } from 'src/modules/memo/domain/entities/memo.entity';
import { CreateMemoCommand } from './create-memo.command';
import { ulid } from 'ulid';
import { ReviewPlan } from 'src/modules/review/domain/entities/review-plan.entity';
import { SpacedRepetitionService } from 'src/modules/review/domain/services/spaced-repetition.service';
import { ReviewGrade } from 'src/modules/review/domain/value-objects/review-grade';
import { UnitOfWork } from 'src/modules/common/infra/unit-of-work';
import { PrismaMemoRepository } from 'src/modules/memo/infra/prisma-memo.repository';
import { PrismaReviewPlanRepository } from 'src/modules/review/infra/prisma-review-plan.repository';

export class CreateMemoUseCase {
  constructor(
    private readonly memoRepository: PrismaMemoRepository,
    private readonly reviewPlanRepository: PrismaReviewPlanRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async execute(command: CreateMemoCommand): Promise<void> {
    const memo = Memo.create(
      ulid(),
      command.userId,
      command.title,
      command.content,
    );

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

    // トランザクション内でメモと復習計画を作成
    await this.unitOfWork.run(async (tx) => {
      await this.memoRepository.createTx(tx, memo);
      await this.reviewPlanRepository.createTx(tx, reviewPlan);
    });
  }
}
