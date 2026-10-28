import { pool } from "../config/database";

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
export async function createAccount(name: unknown): Promise<Account> {
  if (typeof name !== "string" || name.trim().length === 0) {
    const error = new Error("Account name must be provided.");
    (error as any).statusCode = 400;
    throw error;
  }

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
    [name.trim()]
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
  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error("Invalid account ID.");
    (error as any).statusCode = 400;
    throw error;
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
    const error = new Error("Account not found.");
    (error as any).statusCode = 404;
    throw error;
  }

  return result.rows[0];
}