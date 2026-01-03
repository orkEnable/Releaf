import { createParamDecorator } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';

export type CurrentUser = {
  userId: string;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContextHost): CurrentUser => {
    const request = ctx.switchToHttp().getRequest<{ user: CurrentUser }>();
    return request.user;
  },
);
