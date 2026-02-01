import { Injectable } from '@nestjs/common';
import { ReviewLogRepository } from '../domain/review-log.repository';
import { ReviewLog } from '../domain/entities/review-log.entity';
import { ReviewGrade } from '../domain/value-objects/review-grade';
import { PrismaService } from '../../../../prisma/prisma.service';
import { RepositoryPersistenceError } from '../../common/errors';
import { TransactionClient } from '../../common/infra/unit-of-work';

type PrismaClient = PrismaService | TransactionClient;

@Injectable()
export class PrismaReviewLogRepository implements ReviewLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(reviewLog: ReviewLog): Promise<void> {
    await this.createTx(this.prisma, reviewLog);
  }

  /**
   * トランザクション対応の復習ログ作成
   */
  async createTx(tx: PrismaClient, reviewLog: ReviewLog): Promise<void> {
    try {
      await tx.reviewLog.create({
        data: {
          id: reviewLog.id,
          memoId: reviewLog.memoId,
          reviewedAt: reviewLog.reviewedAt,
          grade: reviewLog.grade,
          intervalDays: reviewLog.intervalDays,
        },
      });
    } catch (e) {
      throw new RepositoryPersistenceError('復習ログの作成に失敗しました', e);
    }
  }

  async findByMemoId(memoId: string): Promise<ReviewLog[]> {
    const records = await this.prisma.reviewLog.findMany({
      where: { memoId },
      orderBy: { reviewedAt: 'asc' },
    });

    return records.map((r) =>
      ReviewLog.from(
        r.id,
        r.memoId,
        r.reviewedAt,
        r.grade as ReviewGrade,
        r.intervalDays,
      ),
    );
  }

  async countByMemoId(memoId: string): Promise<number> {
    return this.prisma.reviewLog.count({
      where: { memoId },
    });
  }
}
