import { GetMemosQuery } from './get-memos.query';
import { Memo } from 'src/modules/memo/domain/entities/memo.entity';
import { PrismaMemoRepository } from 'src/modules/memo/infra/prisma-memo.repository';

export class GetMemosUseCase {
  constructor(private readonly memoRepository: PrismaMemoRepository) {}

  async execute(query: GetMemosQuery): Promise<Memo[]> {
    return this.memoRepository.findByUserId(
      query.userId,
      query.limit,
      query.offset,
    );
  }
}
