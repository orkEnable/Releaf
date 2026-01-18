import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RegistUserUseCase } from '../application/commands/regist-user/regist-user.usecase';
import { UpdateUserEmailUseCase } from '../application/commands/update-user-email/update-user-email.usecase';
import { UpdateUserPasswordUseCase } from '../application/commands/update-user-password/update-user-password.usecase';
import { DeleteUserUseCase } from '../application/commands/delete-user/delete-user.usecase';
import { RegistUserCommand } from '../application/commands/regist-user/regist-user.command';
import { UpdateUserEmailCommand } from '../application/commands/update-user-email/update-user-email.command';
import { UpdateUserPasswordCommand } from '../application/commands/update-user-password/update-user-password.command';
import { DeleteUserCommand } from '../application/commands/delete-user/delete-user.command';
import { RegistUserBodyDto } from './dto/regist-user.body.dto';
import { UpdateUserEmailBodyDto } from './dto/update-user-email.body.dto';
import { UpdateUserPasswordBodyDto } from './dto/update-user-password.body.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly registUserUseCase: RegistUserUseCase,
    private readonly updateUserEmailUseCase: UpdateUserEmailUseCase,
    private readonly updateUserPasswordUseCase: UpdateUserPasswordUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegistUserBodyDto): Promise<void> {
    const command = new RegistUserCommand(body.email, body.password, body.name);
    await this.registUserUseCase.execute(command);
  }

  @UseGuards(JwtAuthGuard)
  @Put('email')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateEmail(
    @CurrentUser() user: CurrentUser,
    @Body() body: UpdateUserEmailBodyDto,
  ): Promise<void> {
    const command = new UpdateUserEmailCommand(user.userId, body.email);
    await this.updateUserEmailUseCase.execute(command);
  }

  @UseGuards(JwtAuthGuard)
  @Put('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePassword(
    @CurrentUser() user: CurrentUser,
    @Body() body: UpdateUserPasswordBodyDto,
  ): Promise<void> {
    const command = new UpdateUserPasswordCommand(user.userId, body.password);
    await this.updateUserPasswordUseCase.execute(command);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@CurrentUser() user: CurrentUser): Promise<void> {
    const command = new DeleteUserCommand(user.userId);
    await this.deleteUserUseCase.execute(command);
  }
}
