/**
 * Returns an Express middleware that validates req.body against a zod schema.
 * On success, req.body is replaced with the parsed (and coerced) data.
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}
