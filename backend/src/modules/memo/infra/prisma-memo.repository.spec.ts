import { Test, TestingModule } from '@nestjs/testing';
import { PrismaMemoRepository } from './prisma-memo.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Memo } from '../domain/entities/memo.entity';
import {
  RepositoryConflictError,
  RepositoryNotFoundError,
} from '../../common/errors';

describe('PrismaMemoRepository', () => {
  let repository: PrismaMemoRepository;
  let prismaService: PrismaService;
  let module: TestingModule;
  let testUserId: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [PrismaMemoRepository, PrismaService],
    }).compile();

    repository = module.get<PrismaMemoRepository>(PrismaMemoRepository);
    prismaService = module.get<PrismaService>(PrismaService);

    // PrismaServiceを初期化
    await prismaService.onModuleInit();

    // テスト用のユーザーを作成
    const testUser = await prismaService.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        passwordHash: 'test-password-hash',
        name: 'Test User',
      },
    });
    testUserId = testUser.id;
  });

  afterAll(async () => {
    // テストデータをクリーンアップ
    await prismaService.memo.deleteMany({
      where: { userId: testUserId },
    });
    await prismaService.user.delete({
      where: { id: testUserId },
    });
    await prismaService.onModuleDestroy();
  });

  afterEach(async () => {
    // 各テスト後にメモを削除
    await prismaService.memo.deleteMany({
      where: { userId: testUserId },
    });
  });

  describe('正常系', () => {
    describe('create', () => {
      it('メモを作成できる', async () => {
        const now = new Date();
        const memo = Memo.create(
          `test-id-${Date.now()}`,
          testUserId,
          'Test Title',
          'Test Content',
          now,
          now,
        );

        await repository.create(memo);

        const createdMemo = await prismaService.memo.findUnique({
          where: { id: memo.id },
        });

        expect(createdMemo).toBeTruthy();
        expect(createdMemo?.id).toBe(memo.id);
        expect(createdMemo?.userId).toBe(testUserId);
        expect(createdMemo?.title).toBe('Test Title');
        expect(createdMemo?.content).toBe('Test Content');
      });
    });

    describe('update', () => {
      it('メモのタイトルを変更できる', async () => {
        const now = new Date();
        const memoId = `test-id-${Date.now()}`;
        const memo = Memo.create(
          memoId,
          testUserId,
          'Original Title',
          'Test Content',
          now,
          now,
        );

        await repository.create(memo);

        const updatedMemo = Memo.create(
          memoId,
          testUserId,
          'Updated Title',
          'Test Content',
          now,
          now,
        );
        await repository.update(updatedMemo);

        const result = await repository.findById(memoId);

        expect(result).toBeTruthy();
        expect(result?.title).toBe('Updated Title');
        expect(result?.content).toBe('Test Content');
      });

      it('メモの本文を変更できる', async () => {
        const now = new Date();
        const memoId = `test-id-${Date.now()}`;
        const memo = Memo.create(
          memoId,
          testUserId,
          'Test Title',
          'Original Content',
          now,
          now,
        );

        await repository.create(memo);

        const updatedMemo = Memo.create(
          memoId,
          testUserId,
          'Test Title',
          'Updated Content',
          now,
          now,
        );
        await repository.update(updatedMemo);

        const result = await repository.findById(memoId);

        expect(result).toBeTruthy();
        expect(result?.title).toBe('Test Title');
        expect(result?.content).toBe('Updated Content');
      });
    });

    describe('findById', () => {
      it('id指定でメモがとってこれる', async () => {
        const now = new Date();
        const memoId = `test-id-${Date.now()}`;
        const memo = Memo.create(
          memoId,
          testUserId,
          'Test Title',
          'Test Content',
          now,
          now,
        );

        await repository.create(memo);

        const result = await repository.findById(memoId);

        expect(result).toBeTruthy();
        expect(result?.id).toBe(memoId);
        expect(result?.title).toBe('Test Title');
        expect(result?.content).toBe('Test Content');
      });

      it('存在しないidの場合、nullを返す', async () => {
        const result = await repository.findById('non-existent-id');

        expect(result).toBeNull();
      });
    });

    describe('delete', () => {
      it('should delete a memo', async () => {
        const now = new Date();
        const memoId = `test-id-${Date.now()}`;
        const memo = Memo.create(
          memoId,
          testUserId,
          'Test Title',
          'Test Content',
          now,
          now,
        );

        await repository.create(memo);

        await repository.delete(memoId);

        const result = await repository.findById(memoId);

        expect(result).toBeNull();
      });
    });
  });

  describe('異常系', () => {
    describe('create', () => {
      it('タイトルがない場合、メモを作成できない', () => {
        expect(() => {
          Memo.create(
            'test-id',
            testUserId,
            '',
            'Test Content',
            new Date(),
            new Date(),
          );
        }).toThrow('タイトルは必須です');
      });

      it('タイトルが空白のみの場合、メモを作成できない', () => {
        expect(() => {
          Memo.create(
            'test-id',
            testUserId,
            '   ',
            'Test Content',
            new Date(),
            new Date(),
          );
        }).toThrow('タイトルは必須です');
      });

      it('メモ作成時に、すでに存在していればRepositoryConflictErrorが投げられる', async () => {
        const now = new Date();
        const memoId = `test-id-${Date.now()}`;
        const memo1 = Memo.create(
          memoId,
          testUserId,
          'Test Title 1',
          'Test Content 1',
          now,
          now,
        );
        const memo2 = Memo.create(
          memoId, // 同じIDを使用
          testUserId,
          'Test Title 2',
          'Test Content 2',
          now,
          now,
        );

        await repository.create(memo1);

        await expect(repository.create(memo2)).rejects.toThrow(
          RepositoryConflictError,
        );
      });
    });

    describe('update', () => {
      it('更新時対象がなければRepositoryNotFoundErrorが投げられる', async () => {
        const now = new Date();
        const nonExistentMemoId = `non-existent-${Date.now()}`;
        const memo = Memo.create(
          nonExistentMemoId,
          testUserId,
          'Test Title',
          'Test Content',
          now,
          now,
        );

        await expect(repository.update(memo)).rejects.toThrow(
          RepositoryNotFoundError,
        );
      });
    });

    describe('delete', () => {
      it('削除時に対象がなければRepositoryNotFoundErrorが投げられる', async () => {
        const nonExistentMemoId = `non-existent-${Date.now()}`;

        await expect(repository.delete(nonExistentMemoId)).rejects.toThrow(
          RepositoryNotFoundError,
        );
      });
    });
  });
});
