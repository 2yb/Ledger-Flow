import type {
  Account,
  ApiResponse,
  PaginatedTransactionResponse,
  Transaction,
  TransactionType,
} from "../types/api";

const API_BASE_URL = "http://localhost:5000/api";

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(
      body?.error?.message ?? "Something went wrong."
    );
  }

  return body;
}

/**
 * Fetch all accounts.
 */
export async function getAccounts(): Promise<Account[]> {
  const response = await request<ApiResponse<Account[]>>(
    `${API_BASE_URL}/accounts`
  );

  return response.data;
}

/**
 * Create a new account.
 */
export async function createAccount(
  name: string
): Promise<Account> {
  const response = await request<ApiResponse<Account>>(
    `${API_BASE_URL}/accounts`,
    {
      method: "POST",
      body: JSON.stringify({ name }),
    }
  );

  return response.data;
}

/**
 * Fetch a single account.
 */
export async function getAccount(
  accountId: number
): Promise<Account> {
  const response = await request<ApiResponse<Account>>(
    `${API_BASE_URL}/accounts/${accountId}`
  );

  return response.data;
}

/**
 * Create a credit/debit transaction.
 */
export async function createTransaction(
  accountId: number,
  payload: {
    type: TransactionType;
    amount: number;
    description?: string;
    reference_id: string;
  }
): Promise<Transaction> {
  const response = await request<ApiResponse<Transaction>>(
    `${API_BASE_URL}/accounts/${accountId}/transactions`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  return response.data;
}

/**
 * Fetch paginated transactions.
 */
export async function getTransactions(
  accountId: number,
  page: number,
  limit: number
): Promise<PaginatedTransactionResponse> {
  return request<PaginatedTransactionResponse>(
    `${API_BASE_URL}/accounts/${accountId}/transactions?page=${page}&limit=${limit}`
  );
}