import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Zod validation middleware factory
 * @param schema - Zod schema to validate against
 * @param source - Where to find data ('body', 'query', 'params')
 */
export const validate = (schema: AnyZodObject, source: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the request data
      await schema.parseAsync(req[source]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Validation error',
      });
    }
  };
};
