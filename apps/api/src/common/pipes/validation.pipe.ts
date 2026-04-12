import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

/**
 * Strict Validation Pipe with detailed error messages
 * - Sanitizes input
 * - Validates nested objects
 * - Custom error formatting
 * - Type coercion
 */
@Injectable()
export class StrictValidationPipe implements PipeTransform {
  constructor(
    private options: {
      whitelist?: boolean;
      forbidNonWhitelisted?: boolean;
    } = {},
  ) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object, {
      whitelist: this.options.whitelist ?? true,
      forbidNonWhitelisted: this.options.forbidNonWhitelisted ?? true,
      skipMissingProperties: false,
      forbidUnknownValues: true,
    });

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: this.formatErrors(errors),
        timestamp: new Date().toISOString(),
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(
    errors: ValidationError[],
  ): Array<{ field: string; message: string; value: any }> {
    return errors.map((error) => ({
      field: error.property,
      message: Object.values(error.constraints || {}).join(', '),
      value: error.value,
    }));
  }
}

/**
 * Sanitization Utilities
 */
import { Transform } from 'class-transformer';

export function Sanitize() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      // Remove HTML tags
      return value.replace(/<[^>]*>/g, '').trim();
    }
    return value;
  });
}

export function Trim() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  });
}

export function ToLowerCase() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
    return value;
  });
}

export function ToUpperCase() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toUpperCase();
    }
    return value;
  });
}

/**
 * Custom Validators
 */
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsTurkishPhone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isTurkishPhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          const phoneRegex = /^((\+90|0)?5[0-9]{9})$/;
          return (
            typeof value === 'string' &&
            phoneRegex.test(value.replace(/\s/g, ''))
          );
        },
        defaultMessage() {
          return 'Geçersiz telefon numarası formatı';
        },
      },
    });
  };
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;

          // Min 8 chars, 1 upper, 1 lower, 1 number, 1 special
          const strongRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          return strongRegex.test(value);
        },
        defaultMessage() {
          return 'Şifre en az 8 karakter, 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir';
        },
      },
    });
  };
}

/**
 * Input Sanitization Pipe
 */
@Injectable()
export class SanitizationPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value);
    }
    return this.sanitizeValue(value);
  }

  private sanitizeObject(obj: any): any {
    const sanitized: any = {};

    for (const key of Object.keys(obj)) {
      if (obj[key] !== null && obj[key] !== undefined) {
        sanitized[key] = this.sanitizeValue(obj[key]);
      }
    }

    return sanitized;
  }

  private sanitizeValue(value: any): any {
    if (typeof value === 'string') {
      // Remove potentially dangerous characters
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeValue(item));
    }

    if (typeof value === 'object') {
      return this.sanitizeObject(value);
    }

    return value;
  }
}

/**
 * Pagination Query DTO with validation
 */
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @Sanitize()
  @Trim()
  sortBy?: string;

  @IsOptional()
  @Sanitize()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

/**
 * ID Parameter Validation
 */
import { IsUUID } from 'class-validator';

export class IdParamDto {
  @IsUUID(4, { message: 'Geçersiz ID formatı' })
  id: string;
}

/**
 * Query String Sanitization
 */
@Injectable()
export class QuerySanitizationPipe implements PipeTransform {
  transform(value: any) {
    const sanitized: any = {};

    for (const [key, val] of Object.entries(value)) {
      // Remove dangerous query params
      if (['__proto__', 'constructor', 'prototype'].includes(key)) {
        continue;
      }

      // Sanitize values
      if (typeof val === 'string') {
        sanitized[key] = this.sanitizeString(val);
      } else {
        sanitized[key] = val;
      }
    }

    return sanitized;
  }

  private sanitizeString(str: string): string {
    return str.replace(/[<>]/g, '').replace(/['";]/g, '').substring(0, 1000); // Max length
  }
}
