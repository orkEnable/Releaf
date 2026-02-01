import { Module, forwardRef } from '@nestjs/common';
import { MemoController } from './presentation/memo.controller';
import { CreateMemoUseCase } from './application/commands/create-memo/create-memo.usecase';
import { UpdateMemoUsecase } from './application/commands/update-memo/update-memo.usecase';
import { DeleteMemoUseCase } from './application/commands/delete-memo/delete-memo.usecase';
import { PrismaMemoRepository } from './infra/prisma-memo.repository';
import { PrismaModule } from '../../../prisma/prisma.module';
import { ReviewModule } from '../review/review.module';
import { PrismaReviewPlanRepository } from '../review/infra/prisma-review-plan.repository';
import { UnitOfWork } from '../common/infra/unit-of-work';

const MEMO_REPOSITORY = 'MEMO_REPOSITORY';

@Module({
  imports: [PrismaModule, forwardRef(() => ReviewModule)],
  controllers: [MemoController],
  providers: [
    PrismaMemoRepository,
    UnitOfWork,
    {
      provide: MEMO_REPOSITORY,
      useExisting: PrismaMemoRepository,
    },
    {
      provide: CreateMemoUseCase,
      useFactory: (
        memoRepository: PrismaMemoRepository,
        reviewPlanRepository: PrismaReviewPlanRepository,
        unitOfWork: UnitOfWork,
      ) =>
        new CreateMemoUseCase(memoRepository, reviewPlanRepository, unitOfWork),
      inject: [PrismaMemoRepository, PrismaReviewPlanRepository, UnitOfWork],
    },
    {
      provide: UpdateMemoUsecase,
      useFactory: (memoRepository: PrismaMemoRepository) =>
        new UpdateMemoUsecase(memoRepository),
      inject: [PrismaMemoRepository],
    },
    {
      provide: DeleteMemoUseCase,
      useFactory: (memoRepository: PrismaMemoRepository) =>
        new DeleteMemoUseCase(memoRepository),
      inject: [PrismaMemoRepository],
    },
  ],
  exports: [MEMO_REPOSITORY, PrismaMemoRepository],
})
export class MemoModule {}
