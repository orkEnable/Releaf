import { UserRepository } from 'src/modules/user/domain/user.repository';
import { UpdateUserPasswordCommand } from './update-user-password.command';
import { UserNotFoundError } from '../../error/user-not-found.error';
import { UserAlreadyDeletedError } from '../../error/user-already-deleted.error';
import { hash } from 'bcrypt';

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

    const passwordHash = await hash(command.password, 10);
    const updatedUser = user.updatePasswordHash(passwordHash);
    await this.userRepository.update(updatedUser);
  }
}
