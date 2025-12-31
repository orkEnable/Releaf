import { UserRepository } from 'src/modules/user/domain/user.repository';
import { UpdateUserEmailCommand } from './update-user-email.command';
import { UserNotFoundError } from '../../error/user-not-found.error';
import { UserEmailAlreadyExistsError } from '../../error/user-email-already-exist.error';
import { UserAlreadyDeletedError } from '../../error/user-already-deleted.error';

export class UpdateUserEmailUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UpdateUserEmailCommand): Promise<void> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new UserNotFoundError(command.userId);
    }
    if (user.isDeleted()) {
      throw new UserAlreadyDeletedError(command.userId);
    }

    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser && existingUser.id !== user.id) {
      throw new UserEmailAlreadyExistsError();
    }

    if (command.email === user.email) return;
    const updatedUser = user.updateEmail(command.email);
    await this.userRepository.update(updatedUser);
  }
}
