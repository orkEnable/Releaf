import { Test, TestingModule } from '@nestjs/testing';
import { PrismaUserRepository } from './prisma-user.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { User } from '../domain/entities/user.entity';
import {
  RepositoryConflictError,
  RepositoryNotFoundError,
} from '../../common/errors';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prismaService: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [PrismaUserRepository, PrismaService],
    }).compile();

    repository = module.get<PrismaUserRepository>(PrismaUserRepository);
    prismaService = module.get<PrismaService>(PrismaService);

    // PrismaServiceを初期化
    await prismaService.onModuleInit();
  });

  afterAll(async () => {
    // テストデータをクリーンアップ
    await prismaService.user.deleteMany({
      where: {
        email: {
          startsWith: 'test-',
        },
      },
    });
    await prismaService.onModuleDestroy();
  });

  afterEach(async () => {
    // 各テスト後にテストユーザーを削除
    await prismaService.user.deleteMany({
      where: {
        email: {
          startsWith: 'test-',
        },
      },
    });
  });

  describe('正常系', () => {
    describe('create', () => {
      it('ユーザーを作成できる', async () => {
        const now = new Date();
        const userId = `test-id-${Date.now()}`;
        const email = `test-${Date.now()}@example.com`;
        const user = User.create(
          userId,
          email,
          'password-hash',
          'Test User',
          now,
          now,
        );

        await repository.create(user);

        const createdUser = await prismaService.user.findUnique({
          where: { id: userId },
        });

        expect(createdUser).toBeTruthy();
        expect(createdUser?.id).toBe(userId);
        expect(createdUser?.email).toBe(email);
        expect(createdUser?.passwordHash).toBe('password-hash');
        expect(createdUser?.name).toBe('Test User');
      });
    });

    describe('findById', () => {
      it('特定のユーザーをとってこれる', async () => {
        const now = new Date();
        const userId = `test-id-${Date.now()}`;
        const email = `test-${Date.now()}@example.com`;
        const user = User.create(
          userId,
          email,
          'password-hash',
          'Test User',
          now,
          now,
        );

        await repository.create(user);

        const result = await repository.findById(userId);

        expect(result).toBeTruthy();
        expect(result?.id).toBe(userId);
        expect(result?.email).toBe(email);
        expect(result?.passwordHash).toBe('password-hash');
        expect(result?.name).toBe('Test User');
      });

      it('存在しないidの場合、nullを返す', async () => {
        const result = await repository.findById('non-existent-id');

        expect(result).toBeNull();
      });
    });

    describe('update', () => {
      it('ユーザーの名前を変更できる', async () => {
        const now = new Date();
        const userId = `test-id-${Date.now()}`;
        const email = `test-${Date.now()}@example.com`;
        const user = User.create(
          userId,
          email,
          'password-hash',
          'Original Name',
          now,
          now,
        );

        await repository.create(user);

        const updatedUser = User.create(
          userId,
          email,
          'password-hash',
          'Updated Name',
          now,
          now,
        );
        await repository.update(updatedUser);

        const result = await repository.findById(userId);

        expect(result).toBeTruthy();
        expect(result?.email).toBe(email);
        expect(result?.passwordHash).toBe('password-hash');
        expect(result?.name).toBe('Updated Name');
      });

      it('ユーザーのパスワードハッシュを変更できる', async () => {
        const now = new Date();
        const userId = `test-id-${Date.now()}`;
        const email = `test-${Date.now()}@example.com`;
        const user = User.create(
          userId,
          email,
          'original-password-hash',
          'Test User',
          now,
          now,
        );

        await repository.create(user);

        const updatedUser = User.create(
          userId,
          email,
          'new-password-hash',
          'Test User',
          now,
          now,
        );
        await repository.update(updatedUser);

        const result = await repository.findById(userId);

        expect(result).toBeTruthy();
        expect(result?.email).toBe(email);
        expect(result?.passwordHash).toBe('new-password-hash');
        expect(result?.name).toBe('Test User');
      });
    });

    describe('delete', () => {
      it('ユーザーを削除できる', async () => {
        const now = new Date();
        const userId = `test-id-${Date.now()}`;
        const email = `test-${Date.now()}@example.com`;
        const user = User.create(
          userId,
          email,
          'password-hash',
          'Test User',
          now,
          now,
        );

        await repository.create(user);

        await repository.delete(userId);

        const result = await repository.findById(userId);

        expect(result).toBeNull();
      });
    });
  });

  describe('異常系', () => {
    describe('create', () => {
      it('ユーザー作成時に、すでに存在していればRepositoryConflictErrorが投げられる', async () => {
        const now = new Date();
        const email = `test-${Date.now()}@example.com`;
        const user1 = User.create(
          `test-id-1-${Date.now()}`,
          email,
          'password-hash',
          'Test User 1',
          now,
          now,
        );
        const user2 = User.create(
          `test-id-2-${Date.now()}`,
          email, // 同じemailを使用
          'password-hash',
          'Test User 2',
          now,
          now,
        );

        await repository.create(user1);

        await expect(repository.create(user2)).rejects.toThrow(
          RepositoryConflictError,
        );
      });
    });

    describe('update', () => {
      it('更新時対象がなければRepositoryNotFoundErrorが投げられる', async () => {
        const now = new Date();
        const nonExistentUserId = `non-existent-${Date.now()}`;
        const user = User.create(
          nonExistentUserId,
          `test-${Date.now()}@example.com`,
          'password-hash',
          'Test User',
          now,
          now,
        );

        await expect(repository.update(user)).rejects.toThrow(
          RepositoryNotFoundError,
        );
      });
    });

    describe('delete', () => {
      it('削除時に対象がなければRepositoryNotFoundErrorが投げられる', async () => {
        const nonExistentUserId = `non-existent-${Date.now()}`;

        await expect(repository.delete(nonExistentUserId)).rejects.toThrow(
          RepositoryNotFoundError,
        );
      });
    });
  });
});
