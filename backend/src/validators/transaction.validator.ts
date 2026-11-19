import type {
  CreateTransactionInput,
  TransactionType,
} from "../services/transaction.service";
import { HttpError } from "../utils/http-error";

function isTransactionType(value: unknown): value is TransactionType {
  return value === "credit" || value === "debit";
}

/**
 * Validates and normalizes the transaction request body.
 */
export function validateCreateTransaction(
  body: unknown,
  accountId: number
): CreateTransactionInput {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError("Invalid request body.", 400);
  }

  const data = body as Record<string, unknown>;

  const { type, amount, description, reference_id } = data;

  if (!isTransactionType(type)) {
    throw new HttpError(
      "Transaction type must be either credit or debit.",
      400,
    );
  }

  if (
    typeof amount !== "number" ||
    !Number.isSafeInteger(amount) ||
    amount <= 0
  ) {
    throw new HttpError(
      "Amount must be a positive safe integer representing paise.",
      400,
    );
  }

  if (
    typeof reference_id !== "string" ||
    reference_id.trim().length === 0
  ) {
    throw new HttpError("reference_id must be provided.", 400);
  }

  if (reference_id.trim().length > 100) {
    throw new HttpError("reference_id must be 100 characters or fewer.", 400);
  }

  if (
    description !== undefined &&
    description !== null &&
    typeof description !== "string"
  ) {
    throw new HttpError("description must be a string.", 400);
  }

  if (!Number.isSafeInteger(accountId) || accountId <= 0) {
    throw new HttpError("Invalid account ID.", 400);
  }

  return {
    accountId,
    type,
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
    !Number.isSafeInteger(page) ||
    page < 1
  ) {
    throw new HttpError(
      "Invalid pagination parameter: page must be a positive integer.",
      400,
    );
  }

  if (
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    throw new HttpError(
      "Invalid pagination parameter: limit must be between 1 and 100.",
      400,
    );
  }

  return { page, limit };
}