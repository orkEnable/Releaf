import { GetMemoByIdQuery } from './get-memo-by-id.query';
import { Memo } from 'src/modules/memo/domain/entities/memo.entity';
import { PrismaMemoRepository } from 'src/modules/memo/infra/prisma-memo.repository';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

export class GetMemoByIdUseCase {
  constructor(private readonly memoRepository: PrismaMemoRepository) {}

  async execute(query: GetMemoByIdQuery): Promise<Memo> {
    const memo = await this.memoRepository.findById(query.memoId);

    if (!memo) {
      throw new NotFoundException('メモが見つかりません');
    }

    if (memo.userId !== query.userId) {
      throw new ForbiddenException('このメモにアクセスする権限がありません');
    }

    return memo;
  }
}
