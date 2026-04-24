/**
 * Central error handler.
 * Catches anything passed to next(err) or thrown in async routes
 * (use asyncHandler wrapper below to forward async errors).
 */
export function errorHandler(err, req, res, next) {
  // Prisma unique constraint violation
  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] ?? "field";
    return res.status(409).json({ error: `${field} is already taken.` });
  }

  // Prisma record not found
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Record not found." });
  }

  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message ?? "Internal server error.";

  if (status >= 500) {
    console.error("[ERROR]", err);
  }

  const clientMessage = status >= 500 ? "Internal server error." : message;
  res.status(status).json({ error: clientMessage });
}

/**
 * Wraps an async route handler so errors are forwarded to errorHandler
 * without try/catch in every controller.
 *
 * Usage:  router.post("/", asyncHandler(myController))
 */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
