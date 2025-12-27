import { Injectable } from '@nestjs/common';
import { UserRepository } from '../domain/user.repository';
import { User } from '../domain/entities/user.entity';
import { PrismaService } from 'prisma/prisma.service';
import {
  RepositoryConflictError,
  RepositoryNotFoundError,
  RepositoryPersistenceError,
} from 'src/modules/common/errors';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}
  async create(user: User): Promise<void> {
    try {
      await this.prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2022'
      ) {
        throw new RepositoryConflictError('すでに応募者が存在します。', e);
      }
      throw new RepositoryPersistenceError('応募者の作成に失敗しました。', e);
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

  async update(user: User): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          email: user.email,
          passwordHash: user.passwordHash,
          name: user.name,
          updatedAt: user.updatedAt,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new RepositoryNotFoundError('ユーザーが見つかりません', e);
      }
      throw new RepositoryPersistenceError('ユーザーの更新に失敗しました', e);
    }
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
