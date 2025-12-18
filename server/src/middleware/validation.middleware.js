const { ZodError } = require('zod');

/**
 * Zod validation middleware factory
 * @param {Object} schema - Zod schema to validate against
 * @param {string} source - Where to find data ('body', 'query', 'params')
 */
const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
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

module.exports = { validate };
