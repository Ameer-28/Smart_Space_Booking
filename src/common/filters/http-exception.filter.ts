import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Terjadi kesalahan pada server';
    let error = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as any;
        message = resObj.message || message;
        if (Array.isArray(message)) {
          message = message[0];
        }
        error = resObj.error || error;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      status: false,
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
    });
  }
}
