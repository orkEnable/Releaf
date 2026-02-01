import { Injectable } from '@nestjs/common';
import { ReviewPlanRepository } from '../domain/review-plan.repository';
import { ReviewPlan } from '../domain/entities/review-plan.entity';
import { ReviewPlanStatus } from '../domain/value-objects/review-plan-status';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  RepositoryNotFoundError,
  RepositoryPersistenceError,
} from '../../common/errors';
import { Prisma } from '@prisma/client';
import { TransactionClient } from '../../common/infra/unit-of-work';

type PrismaClient = PrismaService | TransactionClient;

@Injectable()
export class PrismaReviewPlanRepository implements ReviewPlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(reviewPlan: ReviewPlan): Promise<void> {
    await this.createTx(this.prisma, reviewPlan);
  }

  /**
   * トランザクション対応の復習計画作成
   */
  async createTx(tx: PrismaClient, reviewPlan: ReviewPlan): Promise<void> {
    try {
      await tx.reviewPlan.create({
        data: {
          id: reviewPlan.id,
          memoId: reviewPlan.memoId,
          scheduledAt: reviewPlan.scheduledAt,
          status: reviewPlan.status,
          doneAt: reviewPlan.doneAt,
        },
      });
    } catch (e) {
      throw new RepositoryPersistenceError('復習計画の作成に失敗しました。', e);
    }
  }

  async update(reviewPlan: ReviewPlan): Promise<void> {
    await this.updateTx(this.prisma, reviewPlan);
  }

  /**
   * トランザクション対応の復習計画更新
   */
  async updateTx(tx: PrismaClient, reviewPlan: ReviewPlan): Promise<void> {
    try {
      await tx.reviewPlan.update({
        where: { id: reviewPlan.id },
        data: {
          scheduledAt: reviewPlan.scheduledAt,
          status: reviewPlan.status,
          doneAt: reviewPlan.doneAt,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new RepositoryNotFoundError('復習計画が見つかりません', e);
      }
      throw new RepositoryPersistenceError('復習計画の更新に失敗しました', e);
    }
  }

  async findById(id: string): Promise<ReviewPlan | null> {
    const record = await this.prisma.reviewPlan.findUnique({
      where: { id },
    });

    if (record === null) {
      return null;
    }

    return ReviewPlan.from(
      record.id,
      record.memoId,
      record.scheduledAt,
      record.status as ReviewPlanStatus,
      record.doneAt,
      record.createdAt,
      record.updatedAt,
    );
  }

  async findByMemoId(memoId: string): Promise<ReviewPlan[]> {
    const records = await this.prisma.reviewPlan.findMany({
      where: { memoId },
      orderBy: { scheduledAt: 'asc' },
    });

    return records.map((r) =>
      ReviewPlan.from(
        r.id,
        r.memoId,
        r.scheduledAt,
        r.status as ReviewPlanStatus,
        r.doneAt,
        r.createdAt,
        r.updatedAt,
      ),
    );
  }

  async findPendingByMemoId(memoId: string): Promise<ReviewPlan[]> {
    const records = await this.prisma.reviewPlan.findMany({
      where: {
        memoId,
        status: 'PENDING',
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return records.map((r) =>
      ReviewPlan.from(
        r.id,
        r.memoId,
        r.scheduledAt,
        r.status as ReviewPlanStatus,
        r.doneAt,
        r.createdAt,
        r.updatedAt,
      ),
    );
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.reviewPlan.delete({
        where: { id },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new RepositoryNotFoundError('復習計画が見つかりません', e);
      }
      throw new RepositoryPersistenceError('復習計画の削除に失敗しました', e);
    }
  }

  async deleteByMemoId(memoId: string): Promise<void> {
    try {
      await this.prisma.reviewPlan.deleteMany({
        where: { memoId },
      });
    } catch (e) {
      throw new RepositoryPersistenceError('復習計画の削除に失敗しました', e);
    }
  }
}
