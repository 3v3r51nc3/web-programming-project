// Backend developer: Maksym DOLHOV

// Global error handling middleware for Express.
// Called when a route passes an error via next(err).
function errorHandler(err, req, res, next) {
  console.error(err.stack);

  const status = err.status || 500;
  res.status(status).json({
    error: true,
    status_code: status,
    details: err.message || "Internal server error",
  });
}

export default errorHandler;
