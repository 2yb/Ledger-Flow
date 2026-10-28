import { Router } from "express";

import {
  createTransactionController,
  getTransactionsController,
} from "../controllers/transaction.controller";

const router = Router();

/**
 * POST /api/accounts/:accountId/transactions
 */
router.post(
  "/accounts/:accountId/transactions",
  createTransactionController
);

/**
 * GET /api/accounts/:accountId/transactions
 */
router.get(
  "/accounts/:accountId/transactions",
  getTransactionsController
);

export default router;