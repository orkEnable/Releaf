import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginBodyDto } from './dto/login.body.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginBodyDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
