/* eslint-disable @typescript-eslint/unbound-method */
import { CompleteReviewUseCase } from './complete-review.usecase';
import { CompleteReviewCommand } from './complete-review.command';
import { PrismaReviewPlanRepository } from 'src/modules/review/infra/prisma-review-plan.repository';
import { PrismaReviewLogRepository } from 'src/modules/review/infra/prisma-review-log.repository';
import { PrismaMemoRepository } from 'src/modules/memo/infra/prisma-memo.repository';
import { UnitOfWork } from 'src/modules/common/infra/unit-of-work';
import { ReviewPlan } from 'src/modules/review/domain/entities/review-plan.entity';
import { ReviewGrade } from 'src/modules/review/domain/value-objects/review-grade';
import { ReviewPlanStatus } from 'src/modules/review/domain/value-objects/review-plan-status';

describe('CompleteReviewUseCase', () => {
  let useCase: CompleteReviewUseCase;
  let reviewPlanRepository: jest.Mocked<PrismaReviewPlanRepository>;
  let reviewLogRepository: jest.Mocked<PrismaReviewLogRepository>;
  let memoRepository: jest.Mocked<PrismaMemoRepository>;
  let unitOfWork: jest.Mocked<UnitOfWork>;

  beforeEach(() => {
    reviewPlanRepository = {
      create: jest.fn(),
      createTx: jest.fn(),
      update: jest.fn(),
      updateTx: jest.fn(),
      findById: jest.fn(),
      findByMemoId: jest.fn(),
      findPendingByMemoId: jest.fn(),
      delete: jest.fn(),
      deleteByMemoId: jest.fn(),
    } as unknown as jest.Mocked<PrismaReviewPlanRepository>;

    reviewLogRepository = {
      create: jest.fn(),
      createTx: jest.fn(),
      findByMemoId: jest.fn(),
      countByMemoId: jest.fn(),
    } as unknown as jest.Mocked<PrismaReviewLogRepository>;

    memoRepository = {
      create: jest.fn(),
      createTx: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
      incrementReviewCount: jest.fn(),
      incrementReviewCountTx: jest.fn(),
    } as unknown as jest.Mocked<PrismaMemoRepository>;

    unitOfWork = {
      run: jest.fn((fn) => fn({})),
    } as unknown as jest.Mocked<UnitOfWork>;

    useCase = new CompleteReviewUseCase(
      reviewPlanRepository,
      reviewLogRepository,
      memoRepository,
      unitOfWork,
    );
  });

  describe('正常系', () => {
    it('復習を完了し、次の復習計画を作成する', async () => {
      const reviewPlanId = 'plan-123';
      const memoId = 'memo-123';
      const grade = ReviewGrade.GOOD;

      const existingPlan = ReviewPlan.from(
        reviewPlanId,
        memoId,
        new Date(),
        ReviewPlanStatus.PENDING,
        null,
        new Date(),
        new Date(),
      );

      reviewPlanRepository.findById.mockResolvedValue(existingPlan);
      reviewPlanRepository.updateTx.mockResolvedValue(undefined);
      reviewPlanRepository.createTx.mockResolvedValue(undefined);
      reviewLogRepository.findByMemoId.mockResolvedValue([]);
      reviewLogRepository.createTx.mockResolvedValue(undefined);
      memoRepository.incrementReviewCountTx.mockResolvedValue(undefined);

      const command = new CompleteReviewCommand(reviewPlanId, memoId, grade);
      await useCase.execute(command);

      // 現在の計画が完了としてマークされる
      expect(reviewPlanRepository.updateTx).toHaveBeenCalledTimes(1);
      const updatedPlan = reviewPlanRepository.updateTx.mock.calls[0][1];
      expect(updatedPlan.status).toBe(ReviewPlanStatus.DONE);

      // 復習ログが作成される
      expect(reviewLogRepository.createTx).toHaveBeenCalledTimes(1);
      const createdLog = reviewLogRepository.createTx.mock.calls[0][1];
      expect(createdLog.memoId).toBe(memoId);
      expect(createdLog.grade).toBe(grade);

      // 次の復習計画が作成される
      expect(reviewPlanRepository.createTx).toHaveBeenCalledTimes(1);
      const nextPlan = reviewPlanRepository.createTx.mock.calls[0][1];
      expect(nextPlan.memoId).toBe(memoId);
      expect(nextPlan.scheduledAt).toBeInstanceOf(Date);

      // メモの復習統計が更新される
      expect(memoRepository.incrementReviewCountTx).toHaveBeenCalledTimes(1);
      expect(memoRepository.incrementReviewCountTx).toHaveBeenCalledWith(
        expect.anything(),
        memoId,
        expect.any(Date),
      );
    });

    it('全ての更新が同一トランザクションで実行される', async () => {
      const reviewPlanId = 'plan-123';
      const memoId = 'memo-123';
      const grade = ReviewGrade.GOOD;

      const existingPlan = ReviewPlan.from(
        reviewPlanId,
        memoId,
        new Date(),
        ReviewPlanStatus.PENDING,
        null,
        new Date(),
        new Date(),
      );

      reviewPlanRepository.findById.mockResolvedValue(existingPlan);
      reviewPlanRepository.updateTx.mockResolvedValue(undefined);
      reviewPlanRepository.createTx.mockResolvedValue(undefined);
      reviewLogRepository.findByMemoId.mockResolvedValue([]);
      reviewLogRepository.createTx.mockResolvedValue(undefined);
      memoRepository.incrementReviewCountTx.mockResolvedValue(undefined);

      const command = new CompleteReviewCommand(reviewPlanId, memoId, grade);
      await useCase.execute(command);

      // UnitOfWork.runが呼ばれていることを確認
      expect(unitOfWork.run).toHaveBeenCalledTimes(1);

      // 全ての操作が同じトランザクションコンテキストで実行される
      const txContext = reviewPlanRepository.updateTx.mock.calls[0][0];
      expect(reviewLogRepository.createTx.mock.calls[0][0]).toBe(txContext);
      expect(reviewPlanRepository.createTx.mock.calls[0][0]).toBe(txContext);
      expect(memoRepository.incrementReviewCountTx.mock.calls[0][0]).toBe(
        txContext,
      );
    });

    it('AGAINの場合、1日後に次の復習が設定される', async () => {
      const reviewPlanId = 'plan-123';
      const memoId = 'memo-123';
      const grade = ReviewGrade.AGAIN;

      const existingPlan = ReviewPlan.from(
        reviewPlanId,
        memoId,
        new Date(),
        ReviewPlanStatus.PENDING,
        null,
        new Date(),
        new Date(),
      );

      reviewPlanRepository.findById.mockResolvedValue(existingPlan);
      reviewPlanRepository.updateTx.mockResolvedValue(undefined);
      reviewPlanRepository.createTx.mockResolvedValue(undefined);
      reviewLogRepository.findByMemoId.mockResolvedValue([]);
      reviewLogRepository.createTx.mockResolvedValue(undefined);
      memoRepository.incrementReviewCountTx.mockResolvedValue(undefined);

      const command = new CompleteReviewCommand(reviewPlanId, memoId, grade);
      await useCase.execute(command);

      const nextPlan = reviewPlanRepository.createTx.mock.calls[0][1];
      const now = new Date();
      const diffMs = nextPlan.scheduledAt.getTime() - now.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      // AGAINの場合は1日後
      expect(diffDays).toBeCloseTo(1, 0);
    });

    it('GOODを繰り返すと間隔が長くなる', async () => {
      const reviewPlanId = 'plan-123';
      const memoId = 'memo-123';
      const grade = ReviewGrade.GOOD;

      const existingPlan = ReviewPlan.from(
        reviewPlanId,
        memoId,
        new Date(),
        ReviewPlanStatus.PENDING,
        null,
        new Date(),
        new Date(),
      );

      // 過去に3回GOODで復習した履歴
      const pastHistories = [
        {
          id: '1',
          memoId,
          reviewedAt: new Date(),
          grade: ReviewGrade.GOOD,
          intervalDays: 1,
        },
        {
          id: '2',
          memoId,
          reviewedAt: new Date(),
          grade: ReviewGrade.GOOD,
          intervalDays: 3,
        },
        {
          id: '3',
          memoId,
          reviewedAt: new Date(),
          grade: ReviewGrade.GOOD,
          intervalDays: 7,
        },
      ];

      reviewPlanRepository.findById.mockResolvedValue(existingPlan);
      reviewPlanRepository.updateTx.mockResolvedValue(undefined);
      reviewPlanRepository.createTx.mockResolvedValue(undefined);
      reviewLogRepository.findByMemoId.mockResolvedValue(
        pastHistories.map((h) => ({
          ...h,
          reviewedAt: h.reviewedAt,
          grade: h.grade,
          intervalDays: h.intervalDays,
        })),
      );
      reviewLogRepository.createTx.mockResolvedValue(undefined);
      memoRepository.incrementReviewCountTx.mockResolvedValue(undefined);

      const command = new CompleteReviewCommand(reviewPlanId, memoId, grade);
      await useCase.execute(command);

      const createdLog = reviewLogRepository.createTx.mock.calls[0][1];
      // 間隔が7日より長くなるはず
      expect(createdLog.intervalDays).toBeGreaterThan(7);
    });
  });

  describe('異常系', () => {
    it('存在しない復習計画の場合エラーを投げる', async () => {
      reviewPlanRepository.findById.mockResolvedValue(null);

      const command = new CompleteReviewCommand(
        'non-existent',
        'memo-123',
        ReviewGrade.GOOD,
      );

      await expect(useCase.execute(command)).rejects.toThrow(
        '復習計画が見つかりません',
      );
    });

    it('復習計画のmemoIdとコマンドのmemoIdが一致しない場合エラーを投げる', async () => {
      const reviewPlanId = 'plan-123';
      const planMemoId = 'memo-123';
      const wrongMemoId = 'memo-456';

      const existingPlan = ReviewPlan.from(
        reviewPlanId,
        planMemoId,
        new Date(),
        ReviewPlanStatus.PENDING,
        null,
        new Date(),
        new Date(),
      );

      reviewPlanRepository.findById.mockResolvedValue(existingPlan);

      const command = new CompleteReviewCommand(
        reviewPlanId,
        wrongMemoId,
        ReviewGrade.GOOD,
      );

      await expect(useCase.execute(command)).rejects.toThrow(
        '復習計画とメモIDが一致しません',
      );

      // トランザクションが実行されていないことを確認
      expect(unitOfWork.run).not.toHaveBeenCalled();
    });
  });
});
