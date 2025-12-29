import { Injectable } from '@nestjs/common';
import { UserRepository } from '../domain/user.repository';
import { User } from '../domain/entities/user.entity';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  RepositoryNotFoundError,
  RepositoryPersistenceError,
} from '../../common/errors';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}
  async save(user: User): Promise<void> {
    try {
      await this.prisma.user.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          name: user.name,
        },
        update: {
          email: user.email,
          passwordHash: user.passwordHash,
          name: user.name,
        },
      });
    } catch (e) {
      throw new RepositoryPersistenceError('ユーザーの保存に失敗しました。', e);
    }
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { id },
    });

    if (record == null) {
      return null;
    }

    return User.from(
      record.id,
      record.email,
      record.passwordHash,
      record.name,
      record.createdAt,
      record.updatedAt,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email },
    });

    if (record == null) {
      return null;
    }

    return User.from(
      record.id,
      record.email,
      record.passwordHash,
      record.name,
      record.createdAt,
      record.updatedAt,
    );
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new RepositoryNotFoundError('ユーザーが見つかりません', e);
      }
      throw new RepositoryPersistenceError('ユーザーの削除に失敗しました', e);
    }
  }
}
