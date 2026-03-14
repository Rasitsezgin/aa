import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Sunucu hatası oluştu';
    let error = 'Internal Server Error';
    let details: string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (exceptionResponse && typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>;
        const respMessage = resp.message;
        const respError = resp.error;

        if (typeof respMessage === 'string') {
          message = respMessage;
        } else {
          message = exception.message;
        }

        if (typeof respError === 'string') {
          error = respError;
        }

        // class-validator hataları array olarak gelir
        if (
          Array.isArray(respMessage) &&
          respMessage.every((item) => typeof item === 'string')
        ) {
          details = respMessage;
          message = 'Doğrulama hatası';
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      // Production'da stack trace loglanır ama response'a eklenmez
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    }

    // 5xx hatalarını her zaman logla
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else if (status >= 400) {
      this.logger.warn(
        `${request.method} ${request.url} → ${status}: ${typeof message === 'string' ? message : JSON.stringify(message)}`,
      );
    }

    const responseBody = {
      statusCode: status,
      error,
      message,
      ...(details ? { details } : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(responseBody);
  }
}
