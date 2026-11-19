import type { Request, Response, NextFunction } from "express";

import {
  createTransaction,
  getAccountTransactions,
} from "../services/transaction.service";

import {
  validateCreateTransaction,
  validatePagination,
} from "../validators/transaction.validator";
import { HttpError } from "../utils/http-error";

/**
 * POST /api/accounts/:accountId/transactions
 */
export async function createTransactionController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const accountId = Number(req.params.accountId);

    const input = validateCreateTransaction(
      req.body,
      accountId
    );

    const transaction = await createTransaction(input);

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/accounts/:accountId/transactions
 */
export async function getTransactionsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const accountId = Number(req.params.accountId);

    if (!Number.isSafeInteger(accountId) || accountId <= 0) {
      throw new HttpError("Invalid account ID.", 400);
    }

    const { page, limit } = validatePagination(
      req.query.page,
      req.query.limit
    );

    const result = await getAccountTransactions(
      accountId,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      data: result.transactions,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}