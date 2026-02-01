/* eslint-disable @typescript-eslint/unbound-method */
import { GetMemosUseCase } from './get-memos.usecase';
import { GetMemosQuery } from './get-memos.query';
import { PrismaMemoRepository } from 'src/modules/memo/infra/prisma-memo.repository';
import { Memo } from 'src/modules/memo/domain/entities/memo.entity';

describe('GetMemosUseCase', () => {
  let useCase: GetMemosUseCase;
  let memoRepository: jest.Mocked<PrismaMemoRepository>;

  beforeEach(() => {
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

    useCase = new GetMemosUseCase(memoRepository);
  });

  it('ユーザーのメモ一覧を取得する', async () => {
    const userId = 'user-123';
    const memos = [
      Memo.from(
        'memo-1',
        userId,
        'タイトル1',
        'コンテンツ1',
        0,
        null,
        new Date(),
        new Date(),
      ),
      Memo.from(
        'memo-2',
        userId,
        'タイトル2',
        'コンテンツ2',
        3,
        new Date(),
        new Date(),
        new Date(),
      ),
    ];

    memoRepository.findByUserId.mockResolvedValue(memos);

    const query = new GetMemosQuery(userId);
    const result = await useCase.execute(query);

    expect(result).toEqual(memos);
    expect(memoRepository.findByUserId).toHaveBeenCalledWith(
      userId,
      undefined,
      undefined,
    );
  });

  it('limitとoffsetを指定してページネーションする', async () => {
    const userId = 'user-123';
    const limit = 10;
    const offset = 20;
    const memos = [
      Memo.from(
        'memo-21',
        userId,
        'タイトル21',
        'コンテンツ21',
        0,
        null,
        new Date(),
        new Date(),
      ),
    ];

    memoRepository.findByUserId.mockResolvedValue(memos);

    const query = new GetMemosQuery(userId, limit, offset);
    const result = await useCase.execute(query);

    expect(result).toEqual(memos);
    expect(memoRepository.findByUserId).toHaveBeenCalledWith(
      userId,
      limit,
      offset,
    );
  });

  it('メモが存在しない場合は空配列を返す', async () => {
    const userId = 'user-123';
    memoRepository.findByUserId.mockResolvedValue([]);

    const query = new GetMemosQuery(userId);
    const result = await useCase.execute(query);

    expect(result).toEqual([]);
  });
});
