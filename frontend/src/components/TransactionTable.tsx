import type { Transaction } from "../types/api";

interface TransactionTableProps {
  transactions: Transaction[];
  page: number;
  hasNextPage: boolean;
  loading?: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export default function TransactionTable({
  transactions,
  page,
  hasNextPage,
  loading = false,
  onPrevious,
  onNext,
}: TransactionTableProps) {
  function formatAmount(transaction: Transaction) {
    const amount = transaction.amount / 100;

    return `${transaction.type === "credit" ? "+" : "-"}₹${amount.toFixed(
      2
    )}`;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-emerald-300" />
          Loading transactions...
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-14 text-center">
        <p className="font-semibold text-slate-200">
          No transactions found
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Create your first transaction to see it here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-white/[0.07]">
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full">
            <thead className="bg-white/[0.025]">
              <tr className="border-b border-white/[0.07]">
                <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:px-5">
                  Reference
                </th>

                <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:px-5">
                  Type
                </th>

                <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:px-5">
                  Description
                </th>

                <th className="px-4 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:px-5">
                  Amount
                </th>

                <th className="px-4 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:px-5">
                  Created
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.05]">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="transition hover:bg-white/[0.025]"
                >
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-200 sm:px-5">
                    {transaction.referenceId}
                  </td>

                  <td className="px-4 py-4 sm:px-5">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        transaction.type ===
                        "credit"
                          ? "bg-emerald-300/10 text-emerald-200"
                          : "bg-rose-300/10 text-rose-200"
                      }`}
                    >
                      {transaction.type === "credit" ? "Credit" : "Debit"}
                    </span>
                  </td>

                  <td className="max-w-xs px-4 py-4 text-sm text-slate-400 sm:px-5">
                    {transaction.description ||
                      "—"}
                  </td>

                  <td
                    className={`whitespace-nowrap px-5 py-4 text-right text-sm font-bold ${
                      transaction.type ===
                      "credit"
                        ? "text-emerald-200"
                        : "text-rose-200"
                    }`}
                  >
                    {formatAmount(transaction)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-right text-xs text-slate-500 sm:px-5 sm:text-sm">
                    {formatDate(
                      transaction.createdAt
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500 sm:text-sm">
          Page{" "}
          <span className="font-semibold text-slate-200">
            {page}
          </span>
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrevious}
            disabled={page === 1 || loading}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!hasNextPage || loading}
            className="rounded-lg bg-emerald-300 px-3 py-2 text-xs font-bold text-[#07120f] transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}