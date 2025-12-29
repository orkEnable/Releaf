import { MemoRepository } from 'src/modules/memo/domain/memo.repository';
import { Memo } from 'src/modules/memo/domain/entities/memo.entity';
import { CreateMemoCommand } from './create-memo.command';
import { ulid } from 'ulid';

export class CreateMemoUseCase {
  constructor(private readonly memoRepository: MemoRepository) {}

  async execute(command: CreateMemoCommand): Promise<void> {
    const memo = Memo.create(
      ulid(),
      command.userId,
      command.title,
      command.content,
    );

    await this.memoRepository.create(memo);
  }
}
