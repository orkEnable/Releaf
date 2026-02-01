import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { PrismaClient } from '@prisma/client';

// Prismaのトランザクションクライアント型
// $transaction内で渡されるクライアントの型
export type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * UnitOfWorkパターンの実装
 * 複数のリポジトリ操作を同一トランザクションで実行する
 */
@Injectable()
export class UnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * トランザクション内で処理を実行する
   * @param fn トランザクションクライアントを受け取るコールバック
   * @returns コールバックの戻り値
   */
  async run<T>(fn: (tx: TransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }
}
