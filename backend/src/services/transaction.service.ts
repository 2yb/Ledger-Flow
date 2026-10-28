import { PoolClient } from "pg";
import { pool } from "../config/database";

export type TransactionType = "credit" | "debit";

export interface CreateTransactionInput {
  accountId: number;
  type: TransactionType;
  amount: number;
  description?: string;
  referenceId: string;
}

export interface Transaction {
  id: number;
  accountId: number;
  type: TransactionType;
  amount: number;
  description: string | null;
  referenceId: string;
  createdAt: Date;
}

/**
 * Creates a transaction and updates the account balance atomically.
 *
 * Both database changes are executed inside the same PostgreSQL
 * transaction. If anything fails, the entire operation is rolled back.
 */
export async function createTransaction(
  input: CreateTransactionInput
): Promise<Transaction> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock the account row so concurrent transactions cannot
    // modify the same account balance at the same time.
    const accountResult = await client.query(
      `
        SELECT id, balance
        FROM accounts
        WHERE id = $1
        FOR UPDATE
      `,
      [input.accountId]
    );

    if (accountResult.rows.length === 0) {
      const error = new Error("Account not found.");
      (error as any).statusCode = 404;
      throw error;
    }

    const currentBalance = Number(accountResult.rows[0].balance);

    // Check for duplicate reference ID before inserting.
    const duplicateResult = await client.query(
      `
        SELECT id
        FROM transactions
        WHERE account_id = $1
          AND reference_id = $2
        LIMIT 1
      `,
      [input.accountId, input.referenceId]
    );

    if (duplicateResult.rows.length > 0) {
      const error = new Error(
        "Duplicate reference_id for this account."
      );
      (error as any).statusCode = 409;
      throw error;
    }

    // Debit transactions require sufficient balance.
    if (input.type === "debit" && currentBalance < input.amount) {
      const error = new Error("Insufficient balance.");
      (error as any).statusCode = 409;
      throw error;
    }

    const balanceChange =
      input.type === "credit"
        ? input.amount
        : -input.amount;

    const newBalance = currentBalance + balanceChange;

    // Insert the immutable transaction record.
    const transactionResult = await client.query<Transaction>(
      `
        INSERT INTO transactions (
          account_id,
          type,
          amount,
          description,
          reference_id
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id,
          account_id AS "accountId",
          type,
          amount,
          description,
          reference_id AS "referenceId",
          created_at AS "createdAt"
      `,
      [
        input.accountId,
        input.type,
        input.amount,
        input.description ?? null,
        input.referenceId,
      ]
    );

    // Update the account balance.
    await client.query(
      `
        UPDATE accounts
        SET
          balance = $1,
          updated_at = NOW()
        WHERE id = $2
      `,
      [newBalance, input.accountId]
    );

    // Commit both operations together.
    await client.query("COMMIT");

    return transactionResult.rows[0];
  } catch (error) {
    // If anything failed, neither the transaction nor balance
    // update should remain persisted.
    await client.query("ROLLBACK");

    throw error;
  } finally {
    client.release();
  }
}

/**
 * Returns transactions for an account using pagination.
 *
 * Transactions are always returned latest-first.
 */
export async function getAccountTransactions(
  accountId: number,
  page: number,
  limit: number
): Promise<{
  transactions: Transaction[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}> {
  const offset = (page - 1) * limit;

  const accountResult = await pool.query(
    `
      SELECT id
      FROM accounts
      WHERE id = $1
    `,
    [accountId]
  );

  if (accountResult.rows.length === 0) {
    const error = new Error("Account not found.");
    (error as any).statusCode = 404;
    throw error;
  }

  const countResult = await pool.query<{ count: string }>(
    `
      SELECT COUNT(*)::text AS count
      FROM transactions
      WHERE account_id = $1
    `,
    [accountId]
  );

  const totalRecords = Number(countResult.rows[0].count);

  const result = await pool.query<Transaction>(
    `
      SELECT
        id,
        account_id AS "accountId",
        type,
        amount,
        description,
        reference_id AS "referenceId",
        created_at AS "createdAt"
      FROM transactions
      WHERE account_id = $1
      ORDER BY created_at DESC, id DESC
      LIMIT $2
      OFFSET $3
    `,
    [accountId, limit, offset]
  );

  return {
    transactions: result.rows,
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
    },
  };
}