// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  async health() {
    const userCount = await this.appService.getUserCount();

    return {
      status: 'ok',
      service: 'releaf-api',
      userCount,
    };
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
