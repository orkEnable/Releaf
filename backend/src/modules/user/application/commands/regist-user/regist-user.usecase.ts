import { UserRepository } from 'src/modules/user/domain/user.repository';
import { RegistUserCommand } from './regist-user.command';
import { UserEmailAlreadyExistsError } from '../../error/user-email-already-exist.error';
import { ulid } from 'ulid';
import { User } from 'src/modules/user/domain/entities/user.entity';

export class RegistUserUseCase {
  constructor(readonly userRepository: UserRepository) {}
  async execute(command: RegistUserCommand) {
    const email = await this.userRepository.findByEmail(command.email);
    if (email) {
      throw new UserEmailAlreadyExistsError();
    }
    const user = User.create(
      ulid(),
      command.email,
      command.passwordHash,
      command.name,
    );
    await this.userRepository.create(user);
  }
}
