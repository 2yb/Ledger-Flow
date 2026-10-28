export type TransactionType = "credit" | "debit";

export interface Account {
  id: number;
  name: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  accountId: number;
  type: TransactionType;
  amount: number;
  description: string | null;
  referenceId: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedTransactionResponse {
  success: boolean;
  data: Transaction[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}