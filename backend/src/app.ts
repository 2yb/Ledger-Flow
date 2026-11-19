import express from "express";
import cors from "cors";

import { checkDatabaseConnection } from "./config/database";
import { errorHandler } from "./middleware/error.middleware";
import { notFoundHandler } from "./middleware/not-found.middleware";
import accountRoutes from "./routes/account.routes";
import transactionRoutes from "./routes/transaction.routes";

const app = express();

app.use(cors());
app.use(express.json({ limit: "100kb" }));

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

app.use(notFoundHandler);
app.use(errorHandler);

export default app;