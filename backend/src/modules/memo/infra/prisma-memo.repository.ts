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
import { TransactionClient } from '../../common/infra/unit-of-work';

type PrismaClient = PrismaService | TransactionClient;

@Injectable()
export class PrismaMemoRepository implements MemoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(memo: Memo): Promise<void> {
    await this.createTx(this.prisma, memo);
  }

  /**
   * トランザクション対応のメモ作成
   */
  async createTx(tx: PrismaClient, memo: Memo): Promise<void> {
    try {
      await tx.memo.create({
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
      record.reviewCount,
      record.lastReviewedAt,
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
      Memo.from(
        r.id,
        r.userId,
        r.title,
        r.content,
        r.reviewCount,
        r.lastReviewedAt,
        r.createdAt,
        r.updatedAt,
      ),
    );
  }

  async incrementReviewCount(id: string, reviewedAt: Date): Promise<void> {
    await this.incrementReviewCountTx(this.prisma, id, reviewedAt);
  }

  /**
   * トランザクション対応の復習統計更新
   */
  async incrementReviewCountTx(
    tx: PrismaClient,
    id: string,
    reviewedAt: Date,
  ): Promise<void> {
    try {
      await tx.memo.update({
        where: { id },
        data: {
          reviewCount: { increment: 1 },
          lastReviewedAt: reviewedAt,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new RepositoryNotFoundError('メモが見つかりません', e);
      }
      throw new RepositoryPersistenceError('復習統計の更新に失敗しました', e);
    }
  }
}
