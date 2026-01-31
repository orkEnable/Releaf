/* eslint-disable @typescript-eslint/unbound-method */
import { CreateMemoUseCase } from './create-memo.usecase';
import { CreateMemoCommand } from './create-memo.command';
import { MemoRepository } from 'src/modules/memo/domain/memo.repository';
import { ReviewPlanRepository } from 'src/modules/review/domain/review-plan.repository';

describe('CreateMemoUseCase', () => {
  let useCase: CreateMemoUseCase;
  let memoRepository: jest.Mocked<MemoRepository>;
  let reviewPlanRepository: jest.Mocked<ReviewPlanRepository>;

  beforeEach(() => {
    memoRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
      incrementReviewCount: jest.fn(),
    };
    reviewPlanRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByMemoId: jest.fn(),
      findPendingByMemoId: jest.fn(),
      delete: jest.fn(),
      deleteByMemoId: jest.fn(),
    };
    useCase = new CreateMemoUseCase(memoRepository, reviewPlanRepository);
  });

  describe('正常系', () => {
    it('メモを作成できる', async () => {
      const userId = 'user-123';
      const title = 'Test Title';
      const content = 'Test Content';

      memoRepository.create.mockResolvedValue(undefined);
      reviewPlanRepository.create.mockResolvedValue(undefined);

      const command = new CreateMemoCommand(userId, title, content);
      await useCase.execute(command);

      expect(memoRepository.create).toHaveBeenCalledTimes(1);
      const createdMemo = memoRepository.create.mock.calls[0][0];
      expect(createdMemo.userId).toBe(userId);
      expect(createdMemo.title).toBe(title);
      expect(createdMemo.content).toBe(content);
      expect(createdMemo.id).toBeDefined();
    });

    it('メモ作成時に初回の復習計画（1日後）が作成される', async () => {
      const userId = 'user-123';
      const title = 'Test Title';
      const content = 'Test Content';

      memoRepository.create.mockResolvedValue(undefined);
      reviewPlanRepository.create.mockResolvedValue(undefined);

      const command = new CreateMemoCommand(userId, title, content);
      await useCase.execute(command);

      expect(reviewPlanRepository.create).toHaveBeenCalledTimes(1);
      const reviewPlan = reviewPlanRepository.create.mock.calls[0][0];

      // メモIDを持っていることを確認
      const createdMemo = memoRepository.create.mock.calls[0][0];
      expect(reviewPlan.memoId).toBe(createdMemo.id);
      expect(reviewPlan.id).toBeDefined();
      expect(reviewPlan.scheduledAt).toBeInstanceOf(Date);

      // 1日後に設定されていることを確認
      const now = new Date();
      const scheduledAt = reviewPlan.scheduledAt;
      const diffMs = scheduledAt.getTime() - now.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeCloseTo(1, 0);
    });
  });

  describe('異常系', () => {
    it('タイトルが空の場合はエラーを投げる', async () => {
      const userId = 'user-123';
      const title = '';
      const content = 'Test Content';

      const command = new CreateMemoCommand(userId, title, content);

      await expect(useCase.execute(command)).rejects.toThrow(
        'タイトルは必須です',
      );
      expect(memoRepository.create).not.toHaveBeenCalled();
    });

    it('タイトルが空白のみの場合はエラーを投げる', async () => {
      const userId = 'user-123';
      const title = '   ';
      const content = 'Test Content';

      const command = new CreateMemoCommand(userId, title, content);

      await expect(useCase.execute(command)).rejects.toThrow(
        'タイトルは必須です',
      );
      expect(memoRepository.create).not.toHaveBeenCalled();
    });
  });
});
