import {
  BadRequestException,
  ValidationPipe as NestValidationPipe,
  HttpStatus,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class ValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        console.log('Validation Errors:', errors);
        
        const formattedErrors = {};
        
        errors.forEach((error) => {
          formattedErrors[error.property] = Object.values(error.constraints || {});
        });

        console.log('Formatted Errors:', formattedErrors);

        throw new BadRequestException({
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: formattedErrors,
        });
      },
    });
  }
}
