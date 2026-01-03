/* eslint-disable @typescript-eslint/unbound-method */
import { UpdateMemoUsecase } from './update-memo.usecase';
import { UpdateMemoCommand } from './update-memo.command';
import { MemoRepository } from 'src/modules/memo/domain/memo.repository';
import { Memo } from 'src/modules/memo/domain/entities/memo.entity';
import { MemoNotFoundApplicationError } from '../../errors/memo-not-found.error';
import { MemoNotOwnedError } from '../../errors/memo-not-owned.error';

describe('UpdateMemoUsecase', () => {
  let useCase: UpdateMemoUsecase;
  let memoRepository: jest.Mocked<MemoRepository>;

  beforeEach(() => {
    memoRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new UpdateMemoUsecase(memoRepository);
  });

  describe('正常系', () => {
    it('メモの所持者であれば更新できる', async () => {
      const userId = 'user-123';
      const memoId = 'memo-456';
      const memo = Memo.from(
        memoId,
        userId,
        'Original Title',
        'Original Content',
        new Date(),
        new Date(),
      );

      memoRepository.findById.mockResolvedValue(memo);
      memoRepository.update.mockResolvedValue(undefined);

      const command = new UpdateMemoCommand(
        memoId,
        userId,
        'Updated Title',
        'Updated Content',
      );
      await useCase.execute(command);

      expect(memoRepository.findById).toHaveBeenCalledWith(memoId);
      expect(memoRepository.update).toHaveBeenCalledTimes(1);
      const updatedMemo = memoRepository.update.mock.calls[0][0];
      expect(updatedMemo.title).toBe('Updated Title');
      expect(updatedMemo.content).toBe('Updated Content');
    });
  });

  describe('異常系', () => {
    it('メモが存在しない場合はMemoNotFoundApplicationErrorを投げる', async () => {
      const userId = 'user-123';
      const memoId = 'non-existent-memo';

      memoRepository.findById.mockResolvedValue(null);

      const command = new UpdateMemoCommand(
        memoId,
        userId,
        'Updated Title',
        'Updated Content',
      );

      await expect(useCase.execute(command)).rejects.toThrow(
        MemoNotFoundApplicationError,
      );
      expect(memoRepository.findById).toHaveBeenCalledWith(memoId);
      expect(memoRepository.update).not.toHaveBeenCalled();
    });

    it('メモの所持者でない場合はMemoNotOwnedErrorを投げる', async () => {
      const ownerId = 'owner-123';
      const otherUserId = 'other-user-456';
      const memoId = 'memo-789';
      const memo = Memo.from(
        memoId,
        ownerId,
        'Original Title',
        'Original Content',
        new Date(),
        new Date(),
      );

      memoRepository.findById.mockResolvedValue(memo);

      const command = new UpdateMemoCommand(
        memoId,
        otherUserId,
        'Updated Title',
        'Updated Content',
      );

      await expect(useCase.execute(command)).rejects.toThrow(MemoNotOwnedError);
      expect(memoRepository.findById).toHaveBeenCalledWith(memoId);
      expect(memoRepository.update).not.toHaveBeenCalled();
    });
  });
});