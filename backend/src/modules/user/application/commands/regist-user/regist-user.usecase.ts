import { UserRepository } from 'src/modules/user/domain/user.repository';
import { RegistUserCommand } from './regist-user.command';
import { UserEmailAlreadyExistsError } from '../../error/user-email-already-exist.error';
import { ulid } from 'ulid';
import { User } from 'src/modules/user/domain/entities/user.entity';
import { hash } from 'bcrypt';

export class RegistUserUseCase {
  constructor(readonly userRepository: UserRepository) {}
  async execute(command: RegistUserCommand) {
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new UserEmailAlreadyExistsError();
    }
    const passwordHash = await hash(command.password, 10);
    const user = User.create(ulid(), command.email, passwordHash, command.name);
    await this.userRepository.create(user);
  }
}
