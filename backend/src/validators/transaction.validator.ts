import { CreateTransactionInput } from "../services/transaction.service";

const VALID_TRANSACTION_TYPES = ["credit", "debit"] as const;

/**
 * Validates and normalizes the transaction request body.
 */
export function validateCreateTransaction(
  body: unknown,
  accountId: number
): CreateTransactionInput {
  if (!body || typeof body !== "object") {
    const error = new Error("Invalid request body.");
    (error as any).statusCode = 400;
    throw error;
  }

  const data = body as Record<string, unknown>;

  const { type, amount, description, reference_id } = data;

  if (
    typeof type !== "string" ||
    !VALID_TRANSACTION_TYPES.includes(
      type as (typeof VALID_TRANSACTION_TYPES)[number]
    )
  ) {
    const error = new Error(
      "Transaction type must be either credit or debit."
    );
    (error as any).statusCode = 400;
    throw error;
  }

  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    !Number.isInteger(amount) ||
    amount <= 0
  ) {
    const error = new Error(
      "Amount must be a positive integer representing paise."
    );
    (error as any).statusCode = 400;
    throw error;
  }

  if (
    typeof reference_id !== "string" ||
    reference_id.trim().length === 0
  ) {
    const error = new Error("reference_id must be provided.");
    (error as any).statusCode = 400;
    throw error;
  }

  if (
    description !== undefined &&
    description !== null &&
    typeof description !== "string"
  ) {
    const error = new Error("description must be a string.");
    (error as any).statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(accountId) || accountId <= 0) {
    const error = new Error("Invalid account ID.");
    (error as any).statusCode = 400;
    throw error;
  }

  return {
    accountId,
    type: type as "credit" | "debit",
    amount,
    description:
      typeof description === "string"
        ? description.trim()
        : undefined,
    referenceId: reference_id.trim(),
  };
}

/**
 * Validates pagination query parameters.
 */
export function validatePagination(
  pageValue: unknown,
  limitValue: unknown
): { page: number; limit: number } {
  const page = pageValue === undefined ? 1 : Number(pageValue);
  const limit = limitValue === undefined ? 10 : Number(limitValue);

  if (
    !Number.isInteger(page) ||
    page < 1
  ) {
    const error = new Error(
      "Invalid pagination parameter: page must be a positive integer."
    );
    (error as any).statusCode = 400;
    throw error;
  }

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    const error = new Error(
      "Invalid pagination parameter: limit must be between 1 and 100."
    );
    (error as any).statusCode = 400;
    throw error;
  }

  return { page, limit };
}