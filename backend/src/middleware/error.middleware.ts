import type { ErrorRequestHandler } from "express";
import { HttpError } from "../utils/http-error";

function getStatusCode(error: unknown): number {
  if (error instanceof HttpError) {
    return error.statusCode;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number" &&
    error.status >= 400 &&
    error.status < 500
  ) {
    return error.status;
  }

  return 500;
}

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  next,
) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const statusCode = getStatusCode(error);
  const message =
    statusCode >= 500
      ? "Internal server error."
      : error instanceof Error
        ? error.message
        : "Request failed.";

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
    },
  });
};