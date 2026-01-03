import { MemoRepository } from 'src/modules/memo/domain/memo.repository';
import { DeleteMemoCommand } from './delete-memo.command';
import { MemoNotFoundApplicationError } from '../../errors/memo-not-found.error';
import { MemoNotOwnedError } from '../../errors/memo-not-owned.error';

export class DeleteMemoUseCase {
  constructor(private readonly memoRepository: MemoRepository) {}
  async execute(command: DeleteMemoCommand): Promise<void> {
    const memo = await this.memoRepository.findById(command.memoId);
    if (!memo) {
      throw new MemoNotFoundApplicationError(command.memoId);
    }
    if (memo.userId !== command.userId) {
      throw new MemoNotOwnedError(command.memoId, command.userId);
    }
    await this.memoRepository.delete(command.memoId);
  }
}
