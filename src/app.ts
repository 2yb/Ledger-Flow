import express from "express";
import cors from "cors";

import { checkDatabaseConnection } from "./config/database";

import accountRoutes from "./routes/account.routes";

const app = express();

app.use(cors());

/**
 * Parse incoming JSON request bodies.
 */
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
 * Account API.
 */
app.use("/api/accounts", accountRoutes);

export default app;