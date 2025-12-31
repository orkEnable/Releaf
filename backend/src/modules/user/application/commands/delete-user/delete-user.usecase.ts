import { UserRepository } from 'src/modules/user/domain/user.repository';
import { DeleteUserCommand } from './delete-user.command';
import { UserNotFoundError } from '../../error/user-not-found.error';
import { UserAlreadyDeletedError } from '../../error/user-already-deleted.error';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new UserNotFoundError(command.userId);
    }
    if (user.isDeleted()) {
      throw new UserAlreadyDeletedError(command.userId);
    }

    const deletedUser = user.delete();
    await this.userRepository.update(deletedUser);
  }
}
