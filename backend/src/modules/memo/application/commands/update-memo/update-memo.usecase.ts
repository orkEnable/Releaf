import { MemoRepository } from 'src/modules/memo/domain/memo.repository';
import { UpdateMemoCommand } from './update-memo.command';
import { MemoNotFoundApplicationError } from '../../errors/memo-not-found.error';

export class UpdateMemoUsecase {
  constructor(private readonly memoRepository: MemoRepository) {}
  async execute(command: UpdateMemoCommand): Promise<void> {
    const memo = await this.memoRepository.findById(command.memoId);
    if (!memo) {
      throw new MemoNotFoundApplicationError(command.memoId);
    }
    memo.update(command.title, command.content);
    await this.memoRepository.update(memo);
  }
}
