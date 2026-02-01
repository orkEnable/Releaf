import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { PrismaReviewPlanRepository } from './infra/prisma-review-plan.repository';
import { PrismaReviewLogRepository } from './infra/prisma-review-log.repository';
import { CompleteReviewUseCase } from './application/commands/complete-review/complete-review.usecase';
import { MemoModule } from '../memo/memo.module';
import { PrismaMemoRepository } from '../memo/infra/prisma-memo.repository';
import { UnitOfWork } from '../common/infra/unit-of-work';

const REVIEW_PLAN_REPOSITORY = 'REVIEW_PLAN_REPOSITORY';
const REVIEW_LOG_REPOSITORY = 'REVIEW_LOG_REPOSITORY';

@Module({
  imports: [PrismaModule, forwardRef(() => MemoModule)],
  providers: [
    PrismaReviewPlanRepository,
    PrismaReviewLogRepository,
    UnitOfWork,
    {
      provide: REVIEW_PLAN_REPOSITORY,
      useExisting: PrismaReviewPlanRepository,
    },
    {
      provide: REVIEW_LOG_REPOSITORY,
      useExisting: PrismaReviewLogRepository,
    },
    {
      provide: CompleteReviewUseCase,
      useFactory: (
        reviewPlanRepository: PrismaReviewPlanRepository,
        reviewLogRepository: PrismaReviewLogRepository,
        memoRepository: PrismaMemoRepository,
        unitOfWork: UnitOfWork,
      ) =>
        new CompleteReviewUseCase(
          reviewPlanRepository,
          reviewLogRepository,
          memoRepository,
          unitOfWork,
        ),
      inject: [
        PrismaReviewPlanRepository,
        PrismaReviewLogRepository,
        PrismaMemoRepository,
        UnitOfWork,
      ],
    },
  ],
  exports: [
    REVIEW_PLAN_REPOSITORY,
    REVIEW_LOG_REPOSITORY,
    PrismaReviewPlanRepository,
    PrismaReviewLogRepository,
    CompleteReviewUseCase,
  ],
})
export class ReviewModule {}
