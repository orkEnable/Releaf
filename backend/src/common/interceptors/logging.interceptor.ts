import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';
import { throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body } = request;
    const now = Date.now();

    this.logger.log(`→ ${method} ${url} ${JSON.stringify(body)}`);

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        this.logger.log(
          `← ${method} ${url} ${response.statusCode} (${Date.now() - now}ms)`,
        );
      }),
      catchError((error) => {
        this.logger.error(
          `✗ ${method} ${url} - ${error.message}`,
          error.stack,
        );
        return throwError(() => error);
      }),
    );
  }
}
