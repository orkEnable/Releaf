/* eslint-disable @typescript-eslint/unbound-method */
import { DeleteMemoUseCase } from './delete-memo.usecase';
import { DeleteMemoCommand } from './delete-memo.command';
import { MemoRepository } from 'src/modules/memo/domain/memo.repository';
import { Memo } from 'src/modules/memo/domain/entities/memo.entity';
import { MemoNotFoundApplicationError } from '../../errors/memo-not-found.error';
import { MemoNotOwnedError } from '../../errors/memo-not-owned.error';

describe('DeleteMemoUseCase', () => {
  let useCase: DeleteMemoUseCase;
  let memoRepository: jest.Mocked<MemoRepository>;

  beforeEach(() => {
    memoRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteMemoUseCase(memoRepository);
  });

  describe('正常系', () => {
    it('メモの所持者であれば削除できる', async () => {
      const userId = 'user-123';
      const memoId = 'memo-456';
      const memo = Memo.from(
        memoId,
        userId,
        'Test Title',
        'Test Content',
        new Date(),
        new Date(),
      );

      memoRepository.findById.mockResolvedValue(memo);
      memoRepository.delete.mockResolvedValue(undefined);

      const command = new DeleteMemoCommand(userId, memoId);
      await useCase.execute(command);

      expect(memoRepository.findById).toHaveBeenCalledWith(memoId);
      expect(memoRepository.delete).toHaveBeenCalledWith(memoId);
    });
  });

  describe('異常系', () => {
    it('メモが存在しない場合はMemoNotFoundApplicationErrorを投げる', async () => {
      const userId = 'user-123';
      const memoId = 'non-existent-memo';

      memoRepository.findById.mockResolvedValue(null);

      const command = new DeleteMemoCommand(userId, memoId);

      await expect(useCase.execute(command)).rejects.toThrow(
        MemoNotFoundApplicationError,
      );
      expect(memoRepository.findById).toHaveBeenCalledWith(memoId);
      expect(memoRepository.delete).not.toHaveBeenCalled();
    });

    it('メモの所持者でない場合はMemoNotOwnedErrorを投げる', async () => {
      const ownerId = 'owner-123';
      const otherUserId = 'other-user-456';
      const memoId = 'memo-789';
      const memo = Memo.from(
        memoId,
        ownerId,
        'Test Title',
        'Test Content',
        new Date(),
        new Date(),
      );

      memoRepository.findById.mockResolvedValue(memo);

      const command = new DeleteMemoCommand(otherUserId, memoId);

      await expect(useCase.execute(command)).rejects.toThrow(MemoNotOwnedError);
      expect(memoRepository.findById).toHaveBeenCalledWith(memoId);
      expect(memoRepository.delete).not.toHaveBeenCalled();
    });
  });
});
