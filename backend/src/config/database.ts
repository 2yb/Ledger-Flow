import "dotenv/config";
import { Pool, PoolClient, types } from "pg";

types.setTypeParser(20, (value) => {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new RangeError("Database integer exceeds the safe numeric range.");
  }
  return parsed;
});

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 2,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export async function checkDatabaseConnection(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("SELECT 1");
  } finally {
    client.release();
  }
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    const result = await callback(client);

    await client.query("COMMIT");
    transactionStarted = false;

    return result;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Failed to roll back database transaction.", rollbackError);
      }
    }
    throw error;
  } finally {
    client.release();
  }
}