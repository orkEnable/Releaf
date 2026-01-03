/* eslint-disable @typescript-eslint/unbound-method */
import { CreateMemoUseCase } from './create-memo.usecase';
import { CreateMemoCommand } from './create-memo.command';
import { MemoRepository } from 'src/modules/memo/domain/memo.repository';

describe('CreateMemoUseCase', () => {
  let useCase: CreateMemoUseCase;
  let memoRepository: jest.Mocked<MemoRepository>;

  beforeEach(() => {
    memoRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new CreateMemoUseCase(memoRepository);
  });

  describe('正常系', () => {
    it('メモを作成できる', async () => {
      const userId = 'user-123';
      const title = 'Test Title';
      const content = 'Test Content';

      memoRepository.create.mockResolvedValue(undefined);

      const command = new CreateMemoCommand(userId, title, content);
      await useCase.execute(command);

      expect(memoRepository.create).toHaveBeenCalledTimes(1);
      const createdMemo = memoRepository.create.mock.calls[0][0];
      expect(createdMemo.userId).toBe(userId);
      expect(createdMemo.title).toBe(title);
      expect(createdMemo.content).toBe(content);
      expect(createdMemo.id).toBeDefined();
    });
  });

  describe('異常系', () => {
    it('タイトルが空の場合はエラーを投げる', async () => {
      const userId = 'user-123';
      const title = '';
      const content = 'Test Content';

      const command = new CreateMemoCommand(userId, title, content);

      await expect(useCase.execute(command)).rejects.toThrow('タイトルは必須です');
      expect(memoRepository.create).not.toHaveBeenCalled();
    });

    it('タイトルが空白のみの場合はエラーを投げる', async () => {
      const userId = 'user-123';
      const title = '   ';
      const content = 'Test Content';

      const command = new CreateMemoCommand(userId, title, content);

      await expect(useCase.execute(command)).rejects.toThrow('タイトルは必須です');
      expect(memoRepository.create).not.toHaveBeenCalled();
    });
  });
});