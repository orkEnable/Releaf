import { Test, TestingModule } from '@nestjs/testing';
import { PrismaUserRepository } from './prisma-user.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { User } from '../domain/entities/user.entity';
import { RepositoryNotFoundError } from '../../common/errors';

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
    describe('save', () => {
      it('新規ユーザーを作成できる', async () => {
        const userId = `test-id-${Date.now()}`;
        const email = `test-${Date.now()}@example.com`;
        const user = User.create(userId, email, 'password-hash', 'Test User');

        await repository.save(user);

        const createdUser = await prismaService.user.findUnique({
          where: { id: userId },
        });

        expect(createdUser).toBeTruthy();
        expect(createdUser?.id).toBe(userId);
        expect(createdUser?.email).toBe(email);
        expect(createdUser?.passwordHash).toBe('password-hash');
        expect(createdUser?.name).toBe('Test User');
        expect(createdUser?.createdAt).toBeInstanceOf(Date);
        expect(createdUser?.updatedAt).toBeInstanceOf(Date);
      });

      it('既存ユーザーの名前を更新できる', async () => {
        const userId = `test-id-${Date.now()}`;
        const email = `test-${Date.now()}@example.com`;
        const user = User.create(
          userId,
          email,
          'password-hash',
          'Original Name',
        );

        await repository.save(user);

        const updatedUser = User.create(
          userId,
          email,
          'password-hash',
          'Updated Name',
        );
        await repository.save(updatedUser);

        const result = await repository.findById(userId);

        expect(result).toBeTruthy();
        expect(result?.email).toBe(email);
        expect(result?.passwordHash).toBe('password-hash');
        expect(result?.name).toBe('Updated Name');
      });

      it('既存ユーザーのパスワードハッシュを更新できる', async () => {
        const userId = `test-id-${Date.now()}`;
        const email = `test-${Date.now()}@example.com`;
        const user = User.create(
          userId,
          email,
          'original-password-hash',
          'Test User',
        );

        await repository.save(user);

        const updatedUser = User.create(
          userId,
          email,
          'new-password-hash',
          'Test User',
        );
        await repository.save(updatedUser);

        const result = await repository.findById(userId);

        expect(result).toBeTruthy();
        expect(result?.email).toBe(email);
        expect(result?.passwordHash).toBe('new-password-hash');
        expect(result?.name).toBe('Test User');
      });
    });

    describe('findById', () => {
      it('特定のユーザーをとってこれる', async () => {
        const userId = `test-id-${Date.now()}`;
        const email = `test-${Date.now()}@example.com`;
        const user = User.create(userId, email, 'password-hash', 'Test User');

        await repository.save(user);

        const result = await repository.findById(userId);

        expect(result).toBeTruthy();
        expect(result?.id).toBe(userId);
        expect(result?.email).toBe(email);
        expect(result?.passwordHash).toBe('password-hash');
        expect(result?.name).toBe('Test User');
        expect(result?.createdAt).toBeInstanceOf(Date);
        expect(result?.updatedAt).toBeInstanceOf(Date);
      });

      it('存在しないidの場合、nullを返す', async () => {
        const result = await repository.findById('non-existent-id');

        expect(result).toBeNull();
      });
    });

    describe('findByEmail', () => {
      it('メールアドレスでユーザーをとってこれる', async () => {
        const userId = `test-id-${Date.now()}`;
        const email = `test-${Date.now()}@example.com`;
        const user = User.create(userId, email, 'password-hash', 'Test User');

        await repository.save(user);

        const result = await repository.findByEmail(email);

        expect(result).toBeTruthy();
        expect(result?.id).toBe(userId);
        expect(result?.email).toBe(email);
        expect(result?.passwordHash).toBe('password-hash');
        expect(result?.name).toBe('Test User');
      });

      it('存在しないメールアドレスの場合、nullを返す', async () => {
        const result = await repository.findByEmail('non-existent@example.com');

        expect(result).toBeNull();
      });
    });

    describe('delete', () => {
      it('ユーザーを削除できる', async () => {
        const userId = `test-id-${Date.now()}`;
        const email = `test-${Date.now()}@example.com`;
        const user = User.create(userId, email, 'password-hash', 'Test User');

        await repository.save(user);

        await repository.delete(userId);

        const result = await repository.findById(userId);

        expect(result).toBeNull();
      });
    });
  });

  describe('異常系', () => {
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
