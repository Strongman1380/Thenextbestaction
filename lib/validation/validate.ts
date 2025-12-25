import { z } from 'zod';
import { NextResponse } from 'next/server';

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationSuccess<T> {
  success: true;
  data: T;
}

interface ValidationFailure {
  success: false;
  response: NextResponse;
  errors: ValidationError[];
}

type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

/**
 * Validate request body against a Zod schema
 *
 * @param body - The request body to validate
 * @param schema - The Zod schema to validate against
 * @returns Validation result with either validated data or error response
 */
export function validateRequest<T>(
  body: unknown,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  const result = schema.safeParse(body);

  if (!result.success) {
    const errors: ValidationError[] = result.error.issues.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return {
      success: false,
      errors,
      response: NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: errors,
        },
        { status: 400 }
      ),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Create a validation middleware for API routes
 *
 * @param schema - The Zod schema to validate against
 * @returns A function that validates request body
 */
export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (body: unknown): ValidationResult<T> => {
    return validateRequest(body, schema);
  };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(e => `${e.field}: ${e.message}`).join('; ');
}
