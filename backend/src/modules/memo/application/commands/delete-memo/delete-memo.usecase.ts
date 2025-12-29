import { MemoRepository } from 'src/modules/memo/domain/memo.repository';
import { DeleteMemoCommand } from './delete-memo.command';
import { MemoNotFoundApplicationError } from '../../errors/memo-not-found.error';

export class DeleteMemoUseCase {
  constructor(private readonly memoRepository: MemoRepository) {}
  async execute(command: DeleteMemoCommand): Promise<void> {
    const memo = await this.memoRepository.findById(command.memoId);
    if (!memo) {
      throw new MemoNotFoundApplicationError(command.memoId);
    }
    await this.memoRepository.delete(command.memoId);
  }
}
