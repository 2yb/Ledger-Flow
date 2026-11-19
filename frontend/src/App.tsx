import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";

import AccountCard from "./components/AccountCard";
import AccountForm from "./components/AccountForm";
import TransactionForm from "./components/TransactionForm";
import TransactionTable from "./components/TransactionTable";
import {
  createTransaction,
  getAccounts,
  getTransactions,
} from "./services/api";
import type {
  Account,
  Transaction,
  TransactionType,
} from "./types/api";

type Page = "dashboard" | "transactions" | "accounts";
type IconName = "overview" | "activity" | "accounts";

const navigation: { id: Page; label: string; icon: IconName }[] = [
  { id: "dashboard", label: "Overview", icon: "overview" },
  { id: "transactions", label: "Transactions", icon: "activity" },
  { id: "accounts", label: "Accounts", icon: "accounts" },
];

const transactionsPerPage = 10;

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatMoney(paise: number): string {
  return moneyFormatter.format(paise / 100);
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      {name === "overview" && (
        <>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </>
      )}
      {name === "activity" && (
        <>
          <path d="M3 12h4l3-7 4 14 3-7h4" />
          <circle cx="12" cy="12" r="9" />
        </>
      )}
      {name === "accounts" && (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M3 9h18M7 15h3" />
          <circle cx="17" cy="14" r="1" />
        </>
      )}
    </svg>
  );
}

function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-300 to-teal-500 font-black text-[#07120f] shadow-lg shadow-emerald-950/30 ${
        small ? "h-10 w-10 text-sm" : "h-11 w-11 text-base"
      }`}
      aria-hidden="true"
    >
      LF
    </div>
  );
}

function NavigationButton({
  page,
  active,
  onNavigate,
  mobile = false,
}: {
  page: (typeof navigation)[number];
  active: boolean;
  onNavigate: (target: Page) => void;
  mobile?: boolean;
}) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={() => onNavigate(page.id)}
      className={`group flex items-center font-semibold transition ${
        mobile
          ? "w-full min-w-0 flex-col justify-center gap-1 rounded-xl px-1 py-2 text-[10px] sm:flex-row sm:gap-2 sm:px-2 sm:py-3 sm:text-sm"
          : "w-full gap-3 rounded-xl px-3 py-3 text-sm"
      } ${
        active
          ? "bg-emerald-300/10 text-emerald-200 ring-1 ring-inset ring-emerald-300/15"
          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
      }`}
    >
      <Icon
        name={page.icon}
        className={`h-[18px] w-[18px] shrink-0 ${
          active ? "text-emerald-300" : "text-slate-500 group-hover:text-slate-300"
        }`}
      />
      <span className="truncate">{page.label}</span>
    </button>
  );
}

function ApiStatus({ online }: { online: boolean | null }) {
  const label = online === null ? "Connecting" : online ? "API online" : "API unavailable";

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          online === null
            ? "animate-pulse bg-amber-300"
            : online
              ? "bg-emerald-300"
              : "bg-rose-400"
        }`}
      />
      {label}
    </span>
  );
}

function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300/80">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

function ErrorNotice({ children }: { children: string }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.07] px-4 py-3 text-sm text-rose-200"
    >
      {children}
    </div>
  );
}

function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-2xl border border-white/[0.07] bg-[#101827]">
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-emerald-300" />
        {label}
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [accountsError, setAccountsError] = useState("");
  const [transactionsError, setTransactionsError] = useState("");
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [transactionPage, setTransactionPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const applyLoadedAccounts = useCallback((loadedAccounts: Account[]) => {
    setAccounts(loadedAccounts);
    setAccountsError("");
    setApiOnline(true);
    setSelectedAccount((current) => {
      if (!current) {
        return null;
      }
      return loadedAccounts.find((account) => account.id === current.id) ?? current;
    });
  }, []);

  const loadAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    try {
      const loadedAccounts = await getAccounts();
      applyLoadedAccounts(loadedAccounts);
    } catch (error) {
      setApiOnline(false);
      setAccountsError(getErrorMessage(error, "Unable to load accounts."));
    } finally {
      setLoadingAccounts(false);
    }
  }, [applyLoadedAccounts]);

  async function loadTransactions(accountId: number, requestedPage = transactionPage) {
    try {
      setLoadingTransactions(true);
      setTransactionsError("");

      const result = await getTransactions(
        accountId,
        requestedPage,
        transactionsPerPage,
      );

      setTransactions(result.data);
      setTransactionPage(result.pagination.currentPage);
      setHasNextPage(result.pagination.currentPage < result.pagination.totalPages);
      setApiOnline(true);
    } catch (error) {
      setTransactions([]);
      setHasNextPage(false);
      setTransactionsError(
        getErrorMessage(error, "Unable to load transactions."),
      );
      setApiOnline(false);
    } finally {
      setLoadingTransactions(false);
    }
  }

  useEffect(() => {
    let active = true;

    getAccounts()
      .then((loadedAccounts) => {
        if (active) {
          applyLoadedAccounts(loadedAccounts);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setApiOnline(false);
          setAccountsError(getErrorMessage(error, "Unable to load accounts."));
        }
      })
      .finally(() => {
        if (active) {
          setLoadingAccounts(false);
        }
      });

    return () => {
      active = false;
    };
  }, [applyLoadedAccounts]);

  function navigate(targetPage: Page) {
    setPage(targetPage);
    if (targetPage === "transactions" && selectedAccount) {
      void loadTransactions(selectedAccount.id, 1);
    }
  }

  async function handleSelectAccount(account: Account) {
    setSelectedAccount(account);
    setTransactionPage(1);
    setPage("transactions");
    await loadTransactions(account.id, 1);
  }

  async function handleTransactionCreated(
    payload: {
      type: TransactionType;
      amount: number;
      description?: string;
      reference_id: string;
    },
  ) {
    if (!selectedAccount) {
      return;
    }

    await createTransaction(selectedAccount.id, payload);
    await loadAccounts();
    await loadTransactions(selectedAccount.id, transactionPage);
  }

  async function handleNextPage() {
    if (!selectedAccount || !hasNextPage || loadingTransactions) {
      return;
    }
    await loadTransactions(selectedAccount.id, transactionPage + 1);
  }

  async function handlePreviousPage() {
    if (!selectedAccount || transactionPage <= 1 || loadingTransactions) {
      return;
    }
    await loadTransactions(selectedAccount.id, transactionPage - 1);
  }

  const totalBalance = accounts.reduce(
    (total, account) => total + account.balance,
    0,
  );

  const pageTitle =
    page === "dashboard"
      ? "Overview"
      : page === "accounts"
        ? "Accounts"
        : "Transactions";

  return (
    <div className="app-backdrop min-h-screen text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] flex-col border-r border-white/[0.07] bg-[#0b111d]/95 px-5 py-6 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-3 px-2">
          <BrandMark />
          <div>
            <p className="text-base font-semibold tracking-tight text-white">
              Ledger Flow
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Finance workspace
            </p>
          </div>
        </div>

        <div className="mt-11 px-2">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Workspace
          </p>
          <nav aria-label="Primary navigation" className="space-y-1.5">
            {navigation.map((item) => (
              <NavigationButton
                key={item.id}
                page={item}
                active={page === item.id}
                onNavigate={navigate}
              />
            ))}
          </nav>
        </div>

        <div className="mt-auto rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Service status
            </span>
            <span
              className={`h-2 w-2 rounded-full ${
                apiOnline === null
                  ? "bg-amber-300"
                  : apiOnline
                    ? "bg-emerald-300"
                    : "bg-rose-400"
              }`}
            />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-200">
            {apiOnline === null
              ? "Checking connection"
              : apiOnline
                ? "All systems operational"
                : "Connection needs attention"}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Your ledger workspace at a glance.
          </p>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[272px]">
        <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#090e18]/90 backdrop-blur-xl">
          <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-4 sm:px-7 lg:h-[76px] lg:px-10">
            <div className="flex items-center gap-3 lg:hidden">
              <BrandMark small />
              <div>
                <p className="text-sm font-semibold text-white">Ledger Flow</p>
                <p className="text-[11px] text-slate-500">Finance workspace</p>
              </div>
            </div>

            <div className="hidden lg:block">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Workspace / {pageTitle}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-200">
                {selectedAccount
                  ? `Viewing ${selectedAccount.name}`
                  : "Your financial overview"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ApiStatus online={apiOnline} />
              <div className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-xs font-bold text-emerald-200 sm:flex">
                LF
              </div>
            </div>
          </div>

          <nav
            aria-label="Mobile primary navigation"
            className="w-full min-w-0 overflow-x-hidden border-t border-white/[0.06] px-3 py-2.5 lg:hidden"
          >
            <div className="mx-auto grid w-full min-w-0 max-w-[1440px] grid-cols-3 gap-1">
              {navigation.map((item) => (
                <NavigationButton
                  key={item.id}
                  page={item}
                  active={page === item.id}
                  onNavigate={navigate}
                  mobile
                />
              ))}
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 py-7 pb-12 sm:px-7 sm:py-9 lg:px-10 lg:py-10">
          {page === "dashboard" && (
            <div className="space-y-7">
              <section className="relative overflow-hidden rounded-[28px] border border-emerald-200/10 bg-gradient-to-br from-[#112a2a] via-[#111d2a] to-[#111827] p-6 shadow-2xl shadow-black/20 sm:p-9">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-emerald-300/[0.08] blur-3xl"
                />
                <div className="relative max-w-3xl">
                  <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-200/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    Personal finance, made clear
                  </p>
                  <h1 className="mt-5 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                    Your ledger.
                    <span className="block text-emerald-200">
                      In perfect focus.
                    </span>
                  </h1>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300/80 sm:text-base sm:leading-7">
                    Keep every account and transaction in view with a calmer,
                    clearer way to manage your money.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => navigate("accounts")}
                      className="rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-bold text-[#07120f] shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
                    >
                      Manage accounts
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("transactions")}
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
                    >
                      View transactions
                    </button>
                  </div>
                </div>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 right-0 hidden h-full w-[34%] opacity-40 lg:block"
                >
                  <div className="absolute bottom-10 right-10 flex h-36 items-end gap-3">
                    {[38, 57, 48, 76, 61, 93, 72].map((height, index) => (
                      <span
                        key={index}
                        className="w-5 rounded-t-md bg-gradient-to-t from-emerald-400/10 to-emerald-200/60"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  <div className="absolute bottom-10 right-0 h-px w-full bg-emerald-100/20" />
                </div>
              </section>

              {accountsError && <ErrorNotice>{accountsError}</ErrorNotice>}

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl border border-white/[0.07] bg-[#101827] p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Accounts tracked
                  </p>
                  <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                    {loadingAccounts ? "—" : accounts.length.toString().padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Across your workspace
                  </p>
                </div>
                <div className="rounded-2xl border border-white/[0.07] bg-[#101827] p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Total ledger balance
                  </p>
                  <p className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    {loadingAccounts ? "—" : formatMoney(totalBalance)}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Combined available balance
                  </p>
                </div>
                <div className="rounded-2xl border border-white/[0.07] bg-[#101827] p-5 sm:col-span-2 sm:p-6 xl:col-span-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Active account
                  </p>
                  <p className="mt-4 truncate text-xl font-semibold text-white">
                    {selectedAccount?.name ?? "None selected"}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {selectedAccount
                      ? `Account #${selectedAccount.id}`
                      : "Choose an account to see its activity"}
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-white/[0.07] bg-[#101827] p-5 sm:p-7">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Your portfolio
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">
                      Accounts at a glance
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("accounts")}
                    className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-200/[0.07]"
                  >
                    All accounts <span aria-hidden="true">→</span>
                  </button>
                </div>
                {loadingAccounts ? (
                  <LoadingPanel label="Loading your accounts..." />
                ) : accounts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 px-5 py-10 text-center">
                    <p className="font-semibold text-slate-200">
                      Start with your first account
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Add an account to begin tracking credits and debits.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("accounts")}
                      className="mt-5 rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-bold text-[#07120f] transition hover:bg-emerald-200"
                    >
                      Create an account
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {accounts.slice(0, 3).map((account) => (
                      <AccountCard
                        key={account.id}
                        account={account}
                        selected={selectedAccount?.id === account.id}
                        onSelect={() => void handleSelectAccount(account)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {page === "accounts" && (
            <div>
              <PageIntro
                eyebrow="Account management"
                title="Your accounts"
                description="Organize the places your money lives and keep every balance easy to understand."
              />
              {accountsError && <div className="mb-5"><ErrorNotice>{accountsError}</ErrorNotice></div>}
              <div className="grid items-start gap-5 xl:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.4fr)]">
                <section className="rounded-2xl border border-white/[0.07] bg-[#101827] p-5 sm:p-7">
                  <AccountForm onCreate={loadAccounts} />
                </section>
                <section className="rounded-2xl border border-white/[0.07] bg-[#101827] p-5 sm:p-7">
                  <div className="mb-5 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Portfolio
                      </p>
                      <h2 className="mt-1 text-lg font-semibold text-white">
                        All accounts
                      </h2>
                    </div>
                    <span className="text-xs text-slate-500">
                      {accounts.length} total
                    </span>
                  </div>
                  {loadingAccounts ? (
                    <LoadingPanel label="Loading your accounts..." />
                  ) : accounts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 px-5 py-12 text-center">
                      <p className="font-semibold text-slate-200">
                        No accounts yet
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Create your first account using the form.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {accounts.map((account) => (
                        <AccountCard
                          key={account.id}
                          account={account}
                          selected={selectedAccount?.id === account.id}
                          onSelect={() => void handleSelectAccount(account)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}

          {page === "transactions" && (
            <div>
              <PageIntro
                eyebrow="Ledger activity"
                title="Transactions"
                description="Record and review account activity with a clear, paginated history."
              />
              {!selectedAccount ? (
                <section className="rounded-2xl border border-dashed border-white/10 bg-[#101827] px-5 py-14 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-200">
                    <Icon name="accounts" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-white">
                    Select an account first
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                    Choose an account to create a transaction and view its
                    ledger history.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("accounts")}
                    className="mt-5 rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-bold text-[#07120f] transition hover:bg-emerald-200"
                  >
                    Browse accounts
                  </button>
                </section>
              ) : (
                <>
                  <section className="mb-5 flex flex-col justify-between gap-4 rounded-2xl border border-white/[0.07] bg-gradient-to-r from-[#12201f] to-[#101827] p-5 sm:flex-row sm:items-center sm:p-6">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-300/10 text-lg font-bold text-emerald-200">
                        {selectedAccount.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                          Selected account · #{selectedAccount.id}
                        </p>
                        <h2 className="mt-1 truncate text-lg font-semibold text-white">
                          {selectedAccount.name}
                        </h2>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/[0.07] bg-black/10 px-4 py-3 sm:text-right">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        Available balance
                      </p>
                      <p className="mt-1 text-lg font-semibold text-emerald-200">
                        {formatMoney(selectedAccount.balance)}
                      </p>
                    </div>
                  </section>

                  <div className="grid items-start gap-5 2xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.5fr)]">
                    <section className="rounded-2xl border border-white/[0.07] bg-[#101827] p-5 sm:p-7">
                      <TransactionForm onSubmit={handleTransactionCreated} />
                    </section>
                    <section className="min-w-0 rounded-2xl border border-white/[0.07] bg-[#101827] p-5 sm:p-7">
                      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                            Account activity
                          </p>
                          <h2 className="mt-1 text-lg font-semibold text-white">
                            Recent transactions
                          </h2>
                        </div>
                        <span className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-400">
                          Page {transactionPage}
                        </span>
                      </div>
                      {transactionsError ? (
                        <ErrorNotice>{transactionsError}</ErrorNotice>
                      ) : (
                        <TransactionTable
                          transactions={transactions}
                          page={transactionPage}
                          hasNextPage={hasNextPage}
                          loading={loadingTransactions}
                          onPrevious={() => void handlePreviousPage()}
                          onNext={() => void handleNextPage()}
                        />
                      )}
                    </section>
                  </div>
                </>
              )}
            </div>
          )}

          <footer className="mt-10 border-t border-white/[0.06] pt-5 text-center text-xs text-slate-600 sm:text-left">
            Ledger Flow <span className="px-1.5">·</span> A clearer view of your ledger
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
