/* eslint-disable @typescript-eslint/unbound-method */
import { CompleteReviewUseCase } from './complete-review.usecase';
import { CompleteReviewCommand } from './complete-review.command';
import { ReviewPlanRepository } from 'src/modules/review/domain/review-plan.repository';
import { ReviewLogRepository } from 'src/modules/review/domain/review-log.repository';
import { MemoRepository } from 'src/modules/memo/domain/memo.repository';
import { ReviewPlan } from 'src/modules/review/domain/entities/review-plan.entity';
import { ReviewGrade } from 'src/modules/review/domain/value-objects/review-grade';
import { ReviewPlanStatus } from 'src/modules/review/domain/value-objects/review-plan-status';

describe('CompleteReviewUseCase', () => {
  let useCase: CompleteReviewUseCase;
  let reviewPlanRepository: jest.Mocked<ReviewPlanRepository>;
  let reviewLogRepository: jest.Mocked<ReviewLogRepository>;
  let memoRepository: jest.Mocked<MemoRepository>;

  beforeEach(() => {
    reviewPlanRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByMemoId: jest.fn(),
      findPendingByMemoId: jest.fn(),
      delete: jest.fn(),
      deleteByMemoId: jest.fn(),
    };
    reviewLogRepository = {
      create: jest.fn(),
      findByMemoId: jest.fn(),
      countByMemoId: jest.fn(),
    };
    memoRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
      incrementReviewCount: jest.fn(),
    };
    useCase = new CompleteReviewUseCase(
      reviewPlanRepository,
      reviewLogRepository,
      memoRepository,
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
      reviewPlanRepository.update.mockResolvedValue(undefined);
      reviewPlanRepository.create.mockResolvedValue(undefined);
      reviewLogRepository.findByMemoId.mockResolvedValue([]);
      reviewLogRepository.create.mockResolvedValue(undefined);
      memoRepository.incrementReviewCount.mockResolvedValue(undefined);

      const command = new CompleteReviewCommand(reviewPlanId, memoId, grade);
      await useCase.execute(command);

      // 現在の計画が完了としてマークされる
      expect(reviewPlanRepository.update).toHaveBeenCalledTimes(1);
      const updatedPlan = reviewPlanRepository.update.mock.calls[0][0];
      expect(updatedPlan.status).toBe(ReviewPlanStatus.DONE);

      // 復習ログが作成される
      expect(reviewLogRepository.create).toHaveBeenCalledTimes(1);
      const createdLog = reviewLogRepository.create.mock.calls[0][0];
      expect(createdLog.memoId).toBe(memoId);
      expect(createdLog.grade).toBe(grade);

      // 次の復習計画が作成される
      expect(reviewPlanRepository.create).toHaveBeenCalledTimes(1);
      const nextPlan = reviewPlanRepository.create.mock.calls[0][0];
      expect(nextPlan.memoId).toBe(memoId);
      expect(nextPlan.scheduledAt).toBeInstanceOf(Date);

      // メモの復習統計が更新される
      expect(memoRepository.incrementReviewCount).toHaveBeenCalledTimes(1);
      expect(memoRepository.incrementReviewCount).toHaveBeenCalledWith(
        memoId,
        expect.any(Date),
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
      reviewPlanRepository.update.mockResolvedValue(undefined);
      reviewPlanRepository.create.mockResolvedValue(undefined);
      reviewLogRepository.findByMemoId.mockResolvedValue([]);
      reviewLogRepository.create.mockResolvedValue(undefined);
      memoRepository.incrementReviewCount.mockResolvedValue(undefined);

      const command = new CompleteReviewCommand(reviewPlanId, memoId, grade);
      await useCase.execute(command);

      const nextPlan = reviewPlanRepository.create.mock.calls[0][0];
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
        { id: '1', memoId, reviewedAt: new Date(), grade: ReviewGrade.GOOD, intervalDays: 1 },
        { id: '2', memoId, reviewedAt: new Date(), grade: ReviewGrade.GOOD, intervalDays: 3 },
        { id: '3', memoId, reviewedAt: new Date(), grade: ReviewGrade.GOOD, intervalDays: 7 },
      ];

      reviewPlanRepository.findById.mockResolvedValue(existingPlan);
      reviewPlanRepository.update.mockResolvedValue(undefined);
      reviewPlanRepository.create.mockResolvedValue(undefined);
      reviewLogRepository.findByMemoId.mockResolvedValue(
        pastHistories.map((h) => ({
          ...h,
          reviewedAt: h.reviewedAt,
          grade: h.grade,
          intervalDays: h.intervalDays,
        })),
      );
      reviewLogRepository.create.mockResolvedValue(undefined);
      memoRepository.incrementReviewCount.mockResolvedValue(undefined);

      const command = new CompleteReviewCommand(reviewPlanId, memoId, grade);
      await useCase.execute(command);

      const createdLog = reviewLogRepository.create.mock.calls[0][0];
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
  });
});
