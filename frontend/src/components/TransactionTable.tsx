import type { Transaction } from "../App";

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
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-slate-500">
          Loading transactions...
        </p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-14 text-center">
        <p className="font-semibold text-slate-700">
          No transactions found
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Create your first transaction to see it here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Reference
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Type
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Description
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Amount
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Created
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-800">
                    {transaction.referenceId}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        transaction.type ===
                        "credit"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>

                  <td className="max-w-xs px-5 py-4 text-sm text-slate-600">
                    {transaction.description ||
                      "—"}
                  </td>

                  <td
                    className={`whitespace-nowrap px-5 py-4 text-right text-sm font-bold ${
                      transaction.type ===
                      "credit"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {formatAmount(transaction)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-slate-500">
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
      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Page{" "}
          <span className="font-semibold text-slate-700">
            {page}
          </span>
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrevious}
            disabled={page === 1 || loading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Previous
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!hasNextPage || loading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}