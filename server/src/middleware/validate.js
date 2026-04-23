import { validationResult } from "express-validator";

/**
 * Runs after express-validator chains.
 * Returns 422 with a structured errors array if validation fails.
 */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
}
