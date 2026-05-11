import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = 'Internal Server Error';
    let code = 'INTERNAL_SERVER_ERROR';

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const { message: msg } = exceptionResponse as any;
      message = msg || message;
    }

    // Log the full error
    this.logger.error(`${status} - ${message}`, exception.stack);

    response.status(status).json({
      success: false,
      error: message,
      code: code,
      timestamp: new Date().toISOString(),
    });
  }
}
