import { useState } from "react";
import type { FormEvent } from "react";
import type { TransactionType } from "../types/api";

interface TransactionFormProps {
  onSubmit: (payload: {
    type: TransactionType;
    amount: number;
    description?: string;
    reference_id: string;
  }) => Promise<void>;
}

export default function TransactionForm({
  onSubmit,
}: TransactionFormProps) {
  const [type, setType] =
    useState<TransactionType>("credit");

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [referenceId, setReferenceId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const rupees = Number(amount);
    const trimmedReference = referenceId.trim();

    if (!Number.isFinite(rupees) || rupees <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!trimmedReference) {
      setError("Reference ID is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await onSubmit({
        type,
        amount: Math.round(rupees * 100),
        description:
          description.trim() || undefined,
        reference_id: trimmedReference,
      });

      setAmount("");
      setDescription("");
      setReferenceId("");
      setType("credit");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create transaction."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Ledger Entry
        </p>

        <h2 className="text-2xl font-bold text-slate-900">
          New Transaction
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Record a credit or debit against this account.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* TYPE */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Transaction Type
          </label>

          <select
            value={type}
            onChange={(event) =>
              setType(
                event.target.value as TransactionType
              )
            }
            disabled={loading}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
          >
            <option value="credit">
              Credit
            </option>

            <option value="debit">
              Debit
            </option>
          </select>
        </div>

        {/* AMOUNT */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Amount (₹)
          </label>

          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
            placeholder="100.00"
            disabled={loading}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
          />
        </div>

        {/* REFERENCE */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Reference ID
          </label>

          <input
            type="text"
            value={referenceId}
            onChange={(event) =>
              setReferenceId(event.target.value)
            }
            placeholder="REF-003"
            maxLength={100}
            disabled={loading}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Description
          </label>

          <input
            type="text"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Transaction description"
            disabled={loading}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
          />
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={
            loading ||
            !amount ||
            !referenceId.trim()
          }
          className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading
            ? "Processing..."
            : "Create Transaction"}
        </button>
      </div>
    </form>
  );
}