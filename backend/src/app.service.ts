// src/app.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getUserCount(): Promise<number> {
    const count = await this.prisma.user.count();
    return count;
  }
}
