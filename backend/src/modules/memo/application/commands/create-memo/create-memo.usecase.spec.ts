/* eslint-disable @typescript-eslint/unbound-method */
import { CreateMemoUseCase } from './create-memo.usecase';
import { CreateMemoCommand } from './create-memo.command';
import { PrismaMemoRepository } from 'src/modules/memo/infra/prisma-memo.repository';
import { PrismaReviewPlanRepository } from 'src/modules/review/infra/prisma-review-plan.repository';
import { UnitOfWork } from 'src/modules/common/infra/unit-of-work';

describe('CreateMemoUseCase', () => {
  let useCase: CreateMemoUseCase;
  let memoRepository: jest.Mocked<PrismaMemoRepository>;
  let reviewPlanRepository: jest.Mocked<PrismaReviewPlanRepository>;
  let unitOfWork: jest.Mocked<UnitOfWork>;

  beforeEach(() => {
    memoRepository = {
      create: jest.fn(),
      createTx: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
      incrementReviewCount: jest.fn(),
    } as unknown as jest.Mocked<PrismaMemoRepository>;

    reviewPlanRepository = {
      create: jest.fn(),
      createTx: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByMemoId: jest.fn(),
      findPendingByMemoId: jest.fn(),
      delete: jest.fn(),
      deleteByMemoId: jest.fn(),
    } as unknown as jest.Mocked<PrismaReviewPlanRepository>;

    unitOfWork = {
      run: jest.fn((fn) => fn({})),
    } as unknown as jest.Mocked<UnitOfWork>;

    useCase = new CreateMemoUseCase(
      memoRepository,
      reviewPlanRepository,
      unitOfWork,
    );
  });

  describe('正常系', () => {
    it('メモを作成できる', async () => {
      const userId = 'user-123';
      const title = 'Test Title';
      const content = 'Test Content';

      memoRepository.createTx.mockResolvedValue(undefined);
      reviewPlanRepository.createTx.mockResolvedValue(undefined);

      const command = new CreateMemoCommand(userId, title, content);
      await useCase.execute(command);

      expect(memoRepository.createTx).toHaveBeenCalledTimes(1);
      const createdMemo = memoRepository.createTx.mock.calls[0][1];
      expect(createdMemo.userId).toBe(userId);
      expect(createdMemo.title).toBe(title);
      expect(createdMemo.content).toBe(content);
      expect(createdMemo.id).toBeDefined();
    });

    it('メモ作成時に初回の復習計画（1日後）が作成される', async () => {
      const userId = 'user-123';
      const title = 'Test Title';
      const content = 'Test Content';

      memoRepository.createTx.mockResolvedValue(undefined);
      reviewPlanRepository.createTx.mockResolvedValue(undefined);

      const command = new CreateMemoCommand(userId, title, content);
      await useCase.execute(command);

      expect(reviewPlanRepository.createTx).toHaveBeenCalledTimes(1);
      const reviewPlan = reviewPlanRepository.createTx.mock.calls[0][1];

      // メモIDを持っていることを確認
      const createdMemo = memoRepository.createTx.mock.calls[0][1];
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

    it('メモと復習計画が同一トランザクションで作成される', async () => {
      const userId = 'user-123';
      const title = 'Test Title';
      const content = 'Test Content';

      memoRepository.createTx.mockResolvedValue(undefined);
      reviewPlanRepository.createTx.mockResolvedValue(undefined);

      const command = new CreateMemoCommand(userId, title, content);
      await useCase.execute(command);

      // UnitOfWork.runが呼ばれていることを確認
      expect(unitOfWork.run).toHaveBeenCalledTimes(1);

      // 同じトランザクションコンテキストで両方のcreateが呼ばれていることを確認
      const txContext = memoRepository.createTx.mock.calls[0][0];
      expect(reviewPlanRepository.createTx.mock.calls[0][0]).toBe(txContext);
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
      expect(memoRepository.createTx).not.toHaveBeenCalled();
    });

    it('タイトルが空白のみの場合はエラーを投げる', async () => {
      const userId = 'user-123';
      const title = '   ';
      const content = 'Test Content';

      const command = new CreateMemoCommand(userId, title, content);

      await expect(useCase.execute(command)).rejects.toThrow(
        'タイトルは必須です',
      );
      expect(memoRepository.createTx).not.toHaveBeenCalled();
    });
  });
});
