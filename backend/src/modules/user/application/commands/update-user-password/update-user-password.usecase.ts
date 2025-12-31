import { UserRepository } from 'src/modules/user/domain/user.repository';
import { UpdateUserPasswordCommand } from './update-user-password.command';
import { UserNotFoundError } from '../../error/user-not-found.error';
import { UserAlreadyDeletedError } from '../../error/user-already-deleted.error';

export class UpdateUserPasswordUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UpdateUserPasswordCommand): Promise<void> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new UserNotFoundError(command.userId);
    }
    if (user.isDeleted()) {
      throw new UserAlreadyDeletedError(command.userId);
    }
    if (command.passwordHash === user.passwordHash) return;

    const updatedUser = user.updatePasswordHash(command.passwordHash);
    await this.userRepository.update(updatedUser);
  }
}
