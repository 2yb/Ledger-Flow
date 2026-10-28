import { Request, Response, NextFunction } from "express";

import {
  createAccount,
  getAccountById,
  getAllAccounts,
} from "../services/account.service";

import { validateCreateAccount } from "../validators/account.validator";

/**
 * POST /api/accounts
 *
 * Creates a new account.
 */
export async function createAccountController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validationError = validateCreateAccount(req.body);

    if (validationError) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: validationError,
        },
      });

      return;
    }

    const account = await createAccount(req.body.name);

    res.status(201).json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/accounts
 *
 * Returns all accounts.
 */
export async function getAccountsController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const accounts = await getAllAccounts();

    res.status(200).json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/accounts/:id
 *
 * Returns a single account.
 */
export async function getAccountController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const accountId = Number(req.params.id);

    if (!Number.isInteger(accountId) || accountId <= 0) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ACCOUNT_ID",
          message: "Account ID must be a positive integer",
        },
      });

      return;
    }

    const account = await getAccountById(accountId);

    if (!account) {
      res.status(404).json({
        success: false,
        error: {
          code: "ACCOUNT_NOT_FOUND",
          message: "Account not found",
        },
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
}