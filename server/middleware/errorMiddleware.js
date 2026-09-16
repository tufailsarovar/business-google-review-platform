export const notFound = (req, res, next) => {
  const error = new Error(
    `Route not found: ${req.method} ${req.originalUrl}`
  );

  error.statusCode = 404;

  next(error);
};

export const errorHandler = (
  error,
  req,
  res,
  next
) => {
  console.error(
    `[${new Date().toISOString()}]`,
    error
  );

  let statusCode =
    error.statusCode ||
    error.status ||
    500;

  let message =
    error.message ||
    "Internal server error.";

  if (error.name === "ValidationError") {
    statusCode = 400;

    const messages = Object.values(
      error.errors || {}
    ).map((item) => item.message);

    message =
      messages.length > 0
        ? messages.join(", ")
        : "Validation failed.";
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier.";
  }

  if (error.code === 11000) {
    statusCode = 409;

    const duplicateFields = Object.keys(
      error.keyPattern || {}
    );

    message =
      duplicateFields.length > 0
        ? `${duplicateFields.join(
            ", "
          )} already exists.`
        : "A record with the provided value already exists.";
  }

  if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token.";
  }

  if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token has expired.";
  }

  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV !== "production") {
    response.stack = error.stack;
  }

  return res
    .status(statusCode)
    .json(response);
};