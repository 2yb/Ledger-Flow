import { useEffect, useState } from "react";

import AccountForm from "./components/AccountForm";
import TransactionForm from "./components/TransactionForm";
import AccountCard from "./components/AccountCard";
import TransactionTable from "./components/TransactionTable";

const API_URL = "http://localhost:5000/api";

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
  type: "credit" | "debit";
  amount: number;
  description: string | null;
  referenceId: string;
  createdAt: string;
}

type Page = "dashboard" | "transactions" | "accounts";

function App() {
  const [page, setPage] =
    useState<Page>("dashboard");

  const [accounts, setAccounts] =
    useState<Account[]>([]);

  const [selectedAccount, setSelectedAccount] =
    useState<Account | null>(null);

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [loadingAccounts, setLoadingAccounts] =
    useState(false);

  const [loadingTransactions, setLoadingTransactions] =
    useState(false);

  const [transactionPage, setTransactionPage] =
    useState(1);

  const [hasNextPage, setHasNextPage] =
    useState(false);

  const TRANSACTIONS_PER_PAGE = 10;

  async function loadAccounts() {
    try {
      setLoadingAccounts(true);

      const response = await fetch(
        `${API_URL}/accounts`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error?.message ||
            "Failed to load accounts."
        );
      }

      const loadedAccounts: Account[] =
        result.data;

      setAccounts(loadedAccounts);

      if (selectedAccount) {
        const updatedAccount =
          loadedAccounts.find(
            (account) =>
              account.id ===
              selectedAccount.id
          );

        if (updatedAccount) {
          setSelectedAccount(
            updatedAccount
          );
        }
      }
    } catch (error) {
      console.error(
        "Failed to load accounts:",
        error
      );
    } finally {
      setLoadingAccounts(false);
    }
  }

  async function loadTransactions(
    accountId: number,
    requestedPage = transactionPage
  ) {
    try {
      setLoadingTransactions(true);

      const response = await fetch(
        `${API_URL}/accounts/${accountId}/transactions?page=${requestedPage}&limit=${TRANSACTIONS_PER_PAGE}`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error?.message ||
            "Failed to load transactions."
        );
      }

      const loadedTransactions =
        result.data || [];

      setTransactions(
        loadedTransactions
      );

      /*
       * Support common pagination response shapes.
       * If your backend sends pagination information,
       * we use it. Otherwise we infer whether another
       * page exists from the number of records returned.
       */
      const pagination =
        result.pagination ||
        result.meta;

      if (pagination) {
        const current =
          pagination.page ??
          pagination.currentPage ??
          requestedPage;

        const totalPages =
          pagination.totalPages;

        if (
          typeof totalPages ===
          "number"
        ) {
          setHasNextPage(
            current < totalPages
          );
        } else {
          setHasNextPage(
            loadedTransactions.length >=
              TRANSACTIONS_PER_PAGE
          );
        }
      } else {
        setHasNextPage(
          loadedTransactions.length >=
            TRANSACTIONS_PER_PAGE
        );
      }
    } catch (error) {
      console.error(
        "Failed to load transactions:",
        error
      );

      setTransactions([]);
      setHasNextPage(false);
    } finally {
      setLoadingTransactions(false);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  async function handleAccountCreated() {
    await loadAccounts();
  }

  async function handleSelectAccount(
    account: Account
  ) {
    setSelectedAccount(account);

    setTransactionPage(1);

    await loadTransactions(
      account.id,
      1
    );

    setPage("transactions");
  }

  async function handleTransactionCreated() {
    await loadAccounts();

    if (selectedAccount) {
      await loadTransactions(
        selectedAccount.id,
        transactionPage
      );
    }
  }

  async function handleNextPage() {
    if (
      !selectedAccount ||
      !hasNextPage ||
      loadingTransactions
    ) {
      return;
    }

    const nextPage =
      transactionPage + 1;

    setTransactionPage(nextPage);

    await loadTransactions(
      selectedAccount.id,
      nextPage
    );
  }

  async function handlePreviousPage() {
    if (
      !selectedAccount ||
      transactionPage <= 1 ||
      loadingTransactions
    ) {
      return;
    }

    const previousPage =
      transactionPage - 1;

    setTransactionPage(
      previousPage
    );

    await loadTransactions(
      selectedAccount.id,
      previousPage
    );
  }

  const totalBalance = accounts.reduce(
    (sum, account) =>
      sum + account.balance,
    0
  );

  function navigate(
    targetPage: Page
  ) {
    setPage(targetPage);

    if (
      targetPage ===
        "transactions" &&
      selectedAccount
    ) {
      setTransactionPage(1);
      loadTransactions(
        selectedAccount.id,
        1
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-slate-950 text-white lg:flex">
        <div className="border-b border-slate-800 px-7 py-7">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-lg font-black text-slate-950">
              LF
            </div>

            <div>
              <h1 className="text-lg font-bold">
                Ledger Flow
              </h1>

              <p className="text-xs text-slate-400">
                Financial workspace
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-7">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
            Workspace
          </p>

          <nav className="space-y-2">
            <button
              type="button"
              onClick={() =>
                navigate("dashboard")
              }
              className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                page === "dashboard"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <span className="text-lg">
                ▦
              </span>

              Dashboard
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("transactions")
              }
              className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                page ===
                "transactions"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <span className="text-lg">
                ◷
              </span>

              Transactions
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("accounts")
              }
              className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                page === "accounts"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <span className="text-lg">
                ◎
              </span>

              Accounts
            </button>
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-800 px-7 py-6">
          <p className="text-xs font-medium text-slate-500">
            Ledger Flow
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Account & transaction management
          </p>
        </div>
      </aside>

      {/* MAIN */}
      <div className="lg:pl-64">
        {/* TOP BAR */}
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-20 items-center justify-between px-6 lg:px-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                {page === "dashboard"
                  ? "Dashboard"
                  : page === "accounts"
                  ? "Accounts"
                  : "Transactions"}
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                Ledger Flow
              </h2>
            </div>

            {selectedAccount && (
              <div className="text-right">
                <p className="text-xs text-slate-400">
                  Selected account
                </p>

                <p className="font-semibold text-slate-900">
                  {selectedAccount.name}
                </p>
              </div>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          {/* DASHBOARD */}
          {page === "dashboard" && (
            <div className="space-y-8">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Overview
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                  Welcome to Ledger Flow
                </h1>

                <p className="mt-2 text-slate-500">
                  Manage accounts and track
                  financial transactions from one
                  workspace.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    Total Accounts
                  </p>

                  <p className="mt-3 text-3xl font-bold text-slate-950">
                    {accounts.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    Total Balance
                  </p>

                  <p className="mt-3 text-3xl font-bold text-slate-950">
                    ₹
                    {(
                      totalBalance / 100
                    ).toFixed(2)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    Selected Account
                  </p>

                  <p className="mt-3 truncate text-xl font-bold text-slate-950">
                    {selectedAccount
                      ?.name || "None"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Accounts
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      Your Accounts
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("accounts")
                    }
                    className="text-sm font-semibold text-slate-700 hover:text-slate-950"
                  >
                    Manage →
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {accounts
                    .slice(0, 3)
                    .map((account) => (
                      <div
                        key={account.id}
                        onClick={() =>
                          handleSelectAccount(
                            account
                          )
                        }
                        className={`cursor-pointer rounded-2xl transition ${
                          selectedAccount?.id ===
                          account.id
                            ? "ring-2 ring-slate-900"
                            : ""
                        }`}
                      >
                        <AccountCard
                          account={account}
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ACCOUNTS */}
          {page === "accounts" && (
            <div className="space-y-8">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Accounts
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight">
                  Manage Accounts
                </h1>

                <p className="mt-2 text-slate-500">
                  Create and select the account you
                  want to manage.
                </p>
              </div>

              {/* CREATE ACCOUNT */}
              <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <AccountForm
                  onCreate={
                    handleAccountCreated
                  }
                />
              </section>

              {/* ACCOUNT LIST */}
              <section>
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Accounts
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Your Accounts
                  </h2>
                </div>

                {loadingAccounts ? (
                  <div className="rounded-2xl bg-white p-10 text-center">
                    <p className="text-sm text-slate-500">
                      Loading accounts...
                    </p>
                  </div>
                ) : accounts.length ===
                  0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                    <p className="font-semibold">
                      No accounts found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Create your first account
                      above.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {accounts.map(
                      (account) => (
                        <div
                          key={account.id}
                          onClick={() =>
                            handleSelectAccount(
                              account
                            )
                          }
                          className={`cursor-pointer rounded-2xl transition ${
                            selectedAccount?.id ===
                            account.id
                              ? "ring-2 ring-slate-900"
                              : ""
                          }`}
                        >
                          <AccountCard
                            account={account}
                          />
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TRANSACTIONS */}
          {page === "transactions" && (
            <div className="space-y-8">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Transactions
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight">
                  Ledger Transactions
                </h1>

                <p className="mt-2 text-slate-500">
                  Create and review transactions for
                  your selected account.
                </p>
              </div>

              {!selectedAccount ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">
                  <p className="text-lg font-semibold">
                    Select an account first
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Go to Accounts and select an
                    account to manage its
                    transactions.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("accounts")
                    }
                    className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Go to Accounts
                  </button>
                </div>
              ) : (
                <>
                  {/* SELECTED ACCOUNT */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Selected Account
                        </p>

                        <h2 className="mt-1 text-2xl font-bold">
                          {selectedAccount.name}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Account #
                          {selectedAccount.id}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 px-5 py-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Current Balance
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-950">
                          ₹
                          {(
                            selectedAccount.balance /
                            100
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* TRANSACTION FORM */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                    <TransactionForm
                      onSubmit={async (
                        payload
                      ) => {
                        const response =
                          await fetch(
                            `${API_URL}/accounts/${selectedAccount.id}/transactions`,
                            {
                              method:
                                "POST",
                              headers: {
                                "Content-Type":
                                  "application/json",
                              },
                              body: JSON.stringify(
                                payload
                              ),
                            }
                          );

                        const result =
                          await response.json();

                        if (
                          !response.ok ||
                          !result.success
                        ) {
                          throw new Error(
                            result.error
                              ?.message ||
                              "Failed to create transaction."
                          );
                        }

                        await handleTransactionCreated();
                      }}
                    />
                  </section>

                  {/* TRANSACTION HISTORY */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                    <div className="mb-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        History
                      </p>

                      <h2 className="mt-1 text-2xl font-bold">
                        Transaction History
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {selectedAccount.name}
                      </p>
                    </div>

                    <TransactionTable
                      transactions={
                        transactions
                      }
                      page={
                        transactionPage
                      }
                      hasNextPage={
                        hasNextPage
                      }
                      loading={
                        loadingTransactions
                      }
                      onPrevious={
                        handlePreviousPage
                      }
                      onNext={
                        handleNextPage
                      }
                    />
                  </section>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;