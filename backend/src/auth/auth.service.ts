import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaUserRepository } from '../modules/user/infra/prisma-user.repository';

// タイミング攻撃対策用のダミーハッシュ（bcrypt cost=10）
const DUMMY_HASH = '$2b$10$dummyhashforsecuritypurposesonly.................';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: PrismaUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findByEmail(email);

    // ユーザーが存在しない場合もbcrypt.compareを実行してタイミング攻撃を防ぐ
    const hashToCompare = user?.passwordHash ?? DUMMY_HASH;
    const isPasswordValid = await bcrypt.compare(password, hashToCompare);

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException(
        'メールアドレスまたはパスワードが正しくありません',
      );
    }

    const accessToken = this.jwtService.sign({ sub: user.id });

    return { accessToken };
  }
}
