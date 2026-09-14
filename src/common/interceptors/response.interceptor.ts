import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  status: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        // Jika controller sudah return object dengan format standar, lewati
        if (data && typeof data === 'object' && 'status' in data && 'statusCode' in data) {
          return data;
        }

        return {
          status: true,
          statusCode,
          message: 'Berhasil memproses permintaan',
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
