import { Module } from '@nestjs/common';
import { UserController } from './presentation/user.controller';
import { RegistUserUseCase } from './application/commands/regist-user/regist-user.usecase';
import { UpdateUserEmailUseCase } from './application/commands/update-user-email/update-user-email.usecase';
import { UpdateUserPasswordUseCase } from './application/commands/update-user-password/update-user-password.usecase';
import { DeleteUserUseCase } from './application/commands/delete-user/delete-user.usecase';
import { PrismaUserRepository } from './infra/prisma-user.repository';
import { PrismaModule } from '../../../prisma/prisma.module';

const USER_REPOSITORY = 'USER_REPOSITORY';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [
    PrismaUserRepository,
    {
      provide: USER_REPOSITORY,
      useExisting: PrismaUserRepository,
    },
    {
      provide: RegistUserUseCase,
      useFactory: (userRepository: PrismaUserRepository) =>
        new RegistUserUseCase(userRepository),
      inject: [PrismaUserRepository],
    },
    {
      provide: UpdateUserEmailUseCase,
      useFactory: (userRepository: PrismaUserRepository) =>
        new UpdateUserEmailUseCase(userRepository),
      inject: [PrismaUserRepository],
    },
    {
      provide: UpdateUserPasswordUseCase,
      useFactory: (userRepository: PrismaUserRepository) =>
        new UpdateUserPasswordUseCase(userRepository),
      inject: [PrismaUserRepository],
    },
    {
      provide: DeleteUserUseCase,
      useFactory: (userRepository: PrismaUserRepository) =>
        new DeleteUserUseCase(userRepository),
      inject: [PrismaUserRepository],
    },
  ],
  exports: [USER_REPOSITORY, PrismaUserRepository],
})
export class UserModule {}
