import { pool } from "../config/database";
import { HttpError } from "../utils/http-error";

/**
 * Account returned by the API.
 */
export interface Account {
  id: number;
  name: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Creates a new account.
 *
 * New accounts always start with a balance of 0.
 */
export async function createAccount(name: string): Promise<Account> {
  const result = await pool.query<Account>(
    `
      INSERT INTO accounts (name)
      VALUES ($1)
      RETURNING
        id,
        name,
        balance,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [name]
  );

  return result.rows[0];
}

/**
 * Returns all accounts.
 */
export async function getAllAccounts(): Promise<Account[]> {
  const result = await pool.query<Account>(
    `
      SELECT
        id,
        name,
        balance,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM accounts
      ORDER BY created_at DESC
    `
  );

  return result.rows;
}

/**
 * Returns an account by ID.
 */
export async function getAccountById(id: number): Promise<Account> {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new HttpError("Invalid account ID.", 400);
  }

  const result = await pool.query<Account>(
    `
      SELECT
        id,
        name,
        balance,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM accounts
      WHERE id = $1
    `,
    [id]
  );

  if (result.rows.length === 0) {
    throw new HttpError("Account not found.", 404);
  }

  return result.rows[0];
}