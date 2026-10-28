import { pool } from "../config/database";

export interface Account {
  id: number;
  name: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Converts a database account row into the API response format.
 */
function mapAccount(row: {
  id: string | number;
  name: string;
  balance: string | number;
  created_at: Date | string;
  updated_at: Date | string;
}): Account {
  return {
    id: Number(row.id),
    name: row.name,
    balance: Number(row.balance),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

/**
 * Creates a new account.
 *
 * New accounts always start with a balance of zero.
 */
export async function createAccount(name: string): Promise<Account> {
  const result = await pool.query(
    `
      INSERT INTO accounts (name)
      VALUES ($1)
      RETURNING id, name, balance, created_at, updated_at
    `,
    [name.trim()]
  );

  return mapAccount(result.rows[0]);
}

/**
 * Returns all accounts.
 */
export async function getAllAccounts(): Promise<Account[]> {
  const result = await pool.query(
    `
      SELECT id, name, balance, created_at, updated_at
      FROM accounts
      ORDER BY created_at DESC
    `
  );

  return result.rows.map(mapAccount);
}

/**
 * Returns one account by ID.
 *
 * Returns null when the account does not exist.
 */
export async function getAccountById(
  accountId: number
): Promise<Account | null> {
  const result = await pool.query(
    `
      SELECT id, name, balance, created_at, updated_at
      FROM accounts
      WHERE id = $1
    `,
    [accountId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapAccount(result.rows[0]);
}