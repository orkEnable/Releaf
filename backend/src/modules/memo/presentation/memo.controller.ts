import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CreateMemoUseCase } from '../application/commands/create-memo/create-memo.usecase';
import { UpdateMemoUsecase } from '../application/commands/update-memo/update-memo.usecase';
import { DeleteMemoUseCase } from '../application/commands/delete-memo/delete-memo.usecase';
import { GetMemosUseCase } from '../application/queries/get-memos/get-memos.usecase';
import { CreateMemoCommand } from '../application/commands/create-memo/create-memo.command';
import { UpdateMemoCommand } from '../application/commands/update-memo/update-memo.command';
import { DeleteMemoCommand } from '../application/commands/delete-memo/delete-memo.command';
import { GetMemosQuery } from '../application/queries/get-memos/get-memos.query';
import { UpdateMemoBodyDto } from './dto/update-memo.body.dto';
import { CreateMemoBodyDto } from './dto/create-memo.body.dto';
import { GetMemosQueryDto } from './dto/get-memos.query.dto';
import { MemoResponseDto } from './dto/memo.response.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('memos')
export class MemoController {
  constructor(
    private readonly createMemoUseCase: CreateMemoUseCase,
    private readonly updateMemoUseCase: UpdateMemoUsecase,
    private readonly deleteMemoUseCase: DeleteMemoUseCase,
    private readonly getMemosUseCase: GetMemosUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: CurrentUser,
    @Body()
    body: CreateMemoBodyDto,
  ): Promise<void> {
    const command = new CreateMemoCommand(
      user.userId,
      body.title,
      body.content,
    );
    await this.createMemoUseCase.execute(command);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @CurrentUser() user: CurrentUser,
    @Param('id') id: string,
    @Body() body: UpdateMemoBodyDto,
  ): Promise<void> {
    const command = new UpdateMemoCommand(
      id,
      user.userId,
      body.title,
      body.content,
    );
    await this.updateMemoUseCase.execute(command);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentUser() user: CurrentUser,
    @Param('id') id: string,
  ): Promise<void> {
    const command = new DeleteMemoCommand(user.userId, id);
    await this.deleteMemoUseCase.execute(command);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async list(
    @CurrentUser() user: CurrentUser,
    @Query() queryDto: GetMemosQueryDto,
  ): Promise<MemoResponseDto[]> {
    const query = new GetMemosQuery(
      user.userId,
      queryDto.limit,
      queryDto.offset,
    );
    const memos = await this.getMemosUseCase.execute(query);
    return MemoResponseDto.fromEntities(memos);
  }
}
