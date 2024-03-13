import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class SequelizeErrorInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      catchError((err) => {
        if (err && err.name === 'SequelizeValidationError') {
          const errors = err.errors.map((error) => ({
            field: error.path,
            message: error.message,
          }));
          return throwError(
            () =>
              new BadRequestException({
                statusCode: 400,
                message: 'Validation failed',
                errors,
              }),
          );
        }

        if (err && err.name === 'SequelizeUniqueConstraintError') {
          const errors = err.errors.map((error) => ({
            field: error.path,
            message: error.message,
          }));
          return throwError(
            () =>
              new BadRequestException({
                statusCode: 400,
                message: 'Unique constraint failed',
                errors,
              }),
          );
        }

        return throwError(() => err);
      }),
    );
  }
}
