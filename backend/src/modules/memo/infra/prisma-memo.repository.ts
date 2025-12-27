import { Injectable } from '@nestjs/common';
import { MemoRepository } from '../domain/memo.repository';
import { Memo } from '../domain/entities/memo.entity';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class PrismaMemoRepository implements MemoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(memo: Memo): Promise<void> {
    await this.prisma.memo.create({
      data: {
        id: memo.id,
        userId: memo.userId,
        title: memo.title,
        content: memo.content,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.memo.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<Memo | null> {
    return await this.prisma.memo.findUnique({
      where: { id },
    });
  }

  async findAll(): Promise<Memo[]> {
    return await this.prisma.memo.findMany();
  }
}
