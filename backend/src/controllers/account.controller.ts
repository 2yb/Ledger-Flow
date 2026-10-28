import { Request, Response, NextFunction } from "express";
import {
  createAccount,
  getAccountById,
  getAllAccounts,
} from "../services/account.service";

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
    const { name } = req.body;

    const account = await createAccount(name);

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
 * Returns a single account by ID.
 */
export async function getAccountController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Number(req.params.id);

    const account = await getAccountById(id);

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
}