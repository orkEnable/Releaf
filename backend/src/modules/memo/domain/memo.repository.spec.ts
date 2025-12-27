import { Test, TestingModule } from '@nestjs/testing';
import { PrismaMemoRepository } from '../infra/prisma-memo.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Memo } from './entities/memo.entity';

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

    describe('findAll', () => {
      it('全件指定でメモをとってこれる', async () => {
        const now = new Date();
        const memo1 = Memo.create(
          `test-id-1-${Date.now()}`,
          testUserId,
          'Test Title 1',
          'Test Content 1',
          now,
          now,
        );
        const memo2 = Memo.create(
          `test-id-2-${Date.now()}`,
          testUserId,
          'Test Title 2',
          'Test Content 2',
          now,
          now,
        );

        await repository.create(memo1);
        await repository.create(memo2);

        const result = await repository.findAll();

        expect(result.length).toBeGreaterThanOrEqual(2);
        const foundMemos = result.filter(
          (m) => m.id === memo1.id || m.id === memo2.id,
        );
        expect(foundMemos.length).toBe(2);
      });

      it('メモが存在しない場合、空配列を返す', async () => {
        // afterEachでクリーンアップされているので、空配列になる
        const result = await repository.findAll();
        const userMemos = result.filter((m) => m.userId === testUserId);

        expect(userMemos.length).toBe(0);
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
    });

    describe('update', () => {
      // 異常系のテストケースは必要に応じて追加
    });

    describe('findById', () => {
      // 異常系のテストケースは必要に応じて追加
    });

    describe('findAll', () => {
      // 異常系のテストケースは必要に応じて追加
    });

    describe('delete', () => {
      // 異常系のテストケースは必要に応じて追加
    });
  });
});
