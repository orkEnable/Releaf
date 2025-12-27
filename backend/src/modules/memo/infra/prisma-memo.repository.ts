import { Injectable } from '@nestjs/common';
import { MemoRepository } from '../domain/memo.repository';
import { Memo } from '../domain/entities/memo.entity';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  RepositoryConflictError,
  RepositoryNotFoundError,
  RepositoryPersistenceError,
} from '../../common/errors';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaMemoRepository implements MemoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(memo: Memo): Promise<void> {
    try {
      await this.prisma.memo.create({
        data: {
          id: memo.id,
          userId: memo.userId,
          title: memo.title,
          content: memo.content,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new RepositoryConflictError(
          '同じidのメモがすでに登録されています。',
          e,
        );
      }
      throw new RepositoryPersistenceError('メモの作成に失敗しました。', e);
    }
  }

  async update(memo: Memo): Promise<void> {
    try {
      await this.prisma.memo.update({
        where: { id: memo.id },
        data: {
          title: memo.title,
          content: memo.content,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new RepositoryNotFoundError('メモが見つかりません', e);
      }
      throw new RepositoryPersistenceError('メモの更新に失敗しました', e);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.memo.delete({
        where: { id },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new RepositoryNotFoundError('メモが見つかりません', e);
      }
      throw new RepositoryPersistenceError('メモの削除に失敗しました', e);
    }
  }

  async findById(id: string): Promise<Memo | null> {
    const record = await this.prisma.memo.findUnique({
      where: { id },
    });

    if (record === null) {
      return null;
    }
    return Memo.from(
      record.id,
      record.userId,
      record.title,
      record.content,
      record.createdAt,
      record.updatedAt,
    );
  }

  async findByUserId(
    userId: string,
    limit?: number,
    offset?: number,
  ): Promise<Memo[]> {
    const records = await this.prisma.memo.findMany({
      where: { userId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) =>
      Memo.create(r.id, r.userId, r.title, r.content, r.createdAt, r.updatedAt),
    );
  }
}
