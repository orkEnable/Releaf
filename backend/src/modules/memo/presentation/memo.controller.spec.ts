/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { MemoController } from './memo.controller';
import { CreateMemoUseCase } from '../application/commands/create-memo/create-memo.usecase';
import { UpdateMemoUsecase } from '../application/commands/update-memo/update-memo.usecase';
import { DeleteMemoUseCase } from '../application/commands/delete-memo/delete-memo.usecase';
import { GetMemosUseCase } from '../application/queries/get-memos/get-memos.usecase';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { CreateMemoCommand } from '../application/commands/create-memo/create-memo.command';
import { UpdateMemoCommand } from '../application/commands/update-memo/update-memo.command';
import { DeleteMemoCommand } from '../application/commands/delete-memo/delete-memo.command';
import { GetMemosQuery } from '../application/queries/get-memos/get-memos.query';
import { Memo } from '../domain/entities/memo.entity';
import type { Request } from 'express';

describe('MemoController', () => {
  let app: INestApplication<App>;
  let createMemoUseCase: jest.Mocked<CreateMemoUseCase>;
  let updateMemoUseCase: jest.Mocked<UpdateMemoUsecase>;
  let deleteMemoUseCase: jest.Mocked<DeleteMemoUseCase>;
  let getMemosUseCase: jest.Mocked<GetMemosUseCase>;

  const mockUserId = 'test-user-id';

  const mockJwtAuthGuard = {
    canActivate: jest.fn(),
  };

  interface AuthenticatedRequest extends Request {
    user: { userId: string };
  }

  beforeEach(async () => {
    createMemoUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateMemoUseCase>;

    updateMemoUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UpdateMemoUsecase>;

    deleteMemoUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<DeleteMemoUseCase>;

    getMemosUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetMemosUseCase>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemoController],
      providers: [
        { provide: CreateMemoUseCase, useValue: createMemoUseCase },
        { provide: UpdateMemoUsecase, useValue: updateMemoUseCase },
        { provide: DeleteMemoUseCase, useValue: deleteMemoUseCase },
        { provide: GetMemosUseCase, useValue: getMemosUseCase },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /memos (作成)', () => {
    it('リクエストが正しければ201を返し、CreateMemoUseCase.executeが呼ばれる', async () => {
      mockJwtAuthGuard.canActivate.mockImplementation(
        (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
          req.user = { userId: mockUserId };
          return true;
        },
      );
      createMemoUseCase.execute.mockResolvedValue(undefined);

      const body = { title: 'Test Title', content: 'Test Content' };

      const response = await request(app.getHttpServer())
        .post('/memos')
        .send(body);

      expect(response.status).toBe(201);
      expect(createMemoUseCase.execute).toHaveBeenCalledTimes(1);
      expect(createMemoUseCase.execute).toHaveBeenCalledWith(
        expect.any(CreateMemoCommand),
      );

      const calledCommand = createMemoUseCase.execute.mock.calls[0][0];
      expect(calledCommand.userId).toBe(mockUserId);
      expect(calledCommand.title).toBe('Test Title');
      expect(calledCommand.content).toBe('Test Content');
    });

    it('JWTがなければ403エラーを返す', async () => {
      mockJwtAuthGuard.canActivate.mockReturnValue(false);

      const body = { title: 'Test Title', content: 'Test Content' };

      const response = await request(app.getHttpServer())
        .post('/memos')
        .send(body);

      expect(response.status).toBe(403);
      expect(createMemoUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('PUT /memos/:id (更新)', () => {
    it('リクエストが正しければ204を返し、UpdateMemoUseCase.executeがidとCurrentUser.userIdを含むCommandで呼ばれる', async () => {
      const memoId = 'test-memo-id';
      mockJwtAuthGuard.canActivate.mockImplementation(
        (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
          req.user = { userId: mockUserId };
          return true;
        },
      );
      updateMemoUseCase.execute.mockResolvedValue(undefined);

      const body = { title: 'Updated Title', content: 'Updated Content' };

      const response = await request(app.getHttpServer())
        .put(`/memos/${memoId}`)
        .send(body);

      expect(response.status).toBe(204);
      expect(updateMemoUseCase.execute).toHaveBeenCalledTimes(1);
      expect(updateMemoUseCase.execute).toHaveBeenCalledWith(
        expect.any(UpdateMemoCommand),
      );

      const calledCommand = updateMemoUseCase.execute.mock.calls[0][0];
      expect(calledCommand.memoId).toBe(memoId);
      expect(calledCommand.userId).toBe(mockUserId);
      expect(calledCommand.title).toBe('Updated Title');
      expect(calledCommand.content).toBe('Updated Content');
    });

    it('JWTなしなら403エラーを返す', async () => {
      mockJwtAuthGuard.canActivate.mockReturnValue(false);

      const body = { title: 'Updated Title', content: 'Updated Content' };

      const response = await request(app.getHttpServer())
        .put('/memos/test-memo-id')
        .send(body);

      expect(response.status).toBe(403);
      expect(updateMemoUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /memos/:id (削除)', () => {
    it('リクエストが正しければ204を返し、DeleteMemoUseCase.executeが呼ばれる', async () => {
      const memoId = 'test-memo-id';
      mockJwtAuthGuard.canActivate.mockImplementation(
        (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
          req.user = { userId: mockUserId };
          return true;
        },
      );
      deleteMemoUseCase.execute.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer()).delete(
        `/memos/${memoId}`,
      );

      expect(response.status).toBe(204);
      expect(deleteMemoUseCase.execute).toHaveBeenCalledTimes(1);
      expect(deleteMemoUseCase.execute).toHaveBeenCalledWith(
        expect.any(DeleteMemoCommand),
      );

      const calledCommand = deleteMemoUseCase.execute.mock.calls[0][0];
      expect(calledCommand.memoId).toBe(memoId);
    });
  });

  describe('GET /memos (一覧取得)', () => {
    it('リクエストが正しければ200を返し、GetMemosUseCase.executeが呼ばれる', async () => {
      mockJwtAuthGuard.canActivate.mockImplementation(
        (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
          req.user = { userId: mockUserId };
          return true;
        },
      );

      const mockMemos = [
        Memo.from(
          'memo-1',
          mockUserId,
          'タイトル1',
          'コンテンツ1',
          0,
          null,
          new Date('2024-01-01'),
          new Date('2024-01-01'),
        ),
        Memo.from(
          'memo-2',
          mockUserId,
          'タイトル2',
          'コンテンツ2',
          3,
          new Date('2024-01-02'),
          new Date('2024-01-01'),
          new Date('2024-01-02'),
        ),
      ];
      getMemosUseCase.execute.mockResolvedValue(mockMemos);

      const response = await request(app.getHttpServer()).get('/memos');

      expect(response.status).toBe(200);
      expect(getMemosUseCase.execute).toHaveBeenCalledTimes(1);
      expect(getMemosUseCase.execute).toHaveBeenCalledWith(
        expect.any(GetMemosQuery),
      );

      const calledQuery = getMemosUseCase.execute.mock.calls[0][0];
      expect(calledQuery.userId).toBe(mockUserId);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].id).toBe('memo-1');
      expect(response.body[1].id).toBe('memo-2');
    });

    it('limitとoffsetを指定できる', async () => {
      mockJwtAuthGuard.canActivate.mockImplementation(
        (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
          req.user = { userId: mockUserId };
          return true;
        },
      );
      getMemosUseCase.execute.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/memos')
        .query({ limit: 10, offset: 20 });

      expect(response.status).toBe(200);

      const calledQuery = getMemosUseCase.execute.mock.calls[0][0];
      expect(calledQuery.limit).toBe(10);
      expect(calledQuery.offset).toBe(20);
    });

    it('JWTなしなら403エラーを返す', async () => {
      mockJwtAuthGuard.canActivate.mockReturnValue(false);

      const response = await request(app.getHttpServer()).get('/memos');

      expect(response.status).toBe(403);
      expect(getMemosUseCase.execute).not.toHaveBeenCalled();
    });
  });
});
