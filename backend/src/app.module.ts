import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MemoModule } from './modules/memo/memo.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, MemoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
