import express, { NextFunction, Request, Response } from "express";
import cors from "cors";

import { checkDatabaseConnection } from "./config/database";
import accountRoutes from "./routes/account.routes";
import transactionRoutes from "./routes/transaction.routes";

const app = express();

app.use(cors());
app.use(express.json());

/**
 * Health check.
 */
app.get("/health", async (_req, res, next) => {
  try {
    await checkDatabaseConnection();

    res.status(200).json({
      success: true,
      message: "Ledger Flow API is healthy",
      database: "connected",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Account endpoints.
 */
app.use("/api/accounts", accountRoutes);

/**
 * Transaction endpoints.
 */
app.use("/api", transactionRoutes);

/**
 * Handles unknown routes.
 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: "Route not found.",
    },
  });
});

/**
 * Centralized application error handler.
 */
app.use(
  (
    error: Error & { statusCode?: number },
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error(error);

    const statusCode = error.statusCode ?? 500;

    res.status(statusCode).json({
      success: false,
      error: {
        message:
          statusCode === 500
            ? "Internal server error."
            : error.message,
      },
    });
  }
);

export default app;