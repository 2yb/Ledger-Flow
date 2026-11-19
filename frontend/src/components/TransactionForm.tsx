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
    const amountInPaise = Math.round(rupees * 100);

    if (!Number.isFinite(rupees) || rupees <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!Number.isSafeInteger(amountInPaise) || amountInPaise <= 0) {
      setError("Amount is outside the supported range.");
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
        amount: amountInPaise,
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
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300/80">
          New ledger entry
        </p>

        <h2 className="text-xl font-semibold text-white">
          Record a transaction
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Add a credit or debit to the selected account.
        </p>
      </div>

      <div className="space-y-5">
        <fieldset>
          <legend className="mb-2 block text-xs font-semibold text-slate-300">
            Transaction type
          </legend>
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/[0.07] bg-[#0b111c] p-1.5">
            {(["credit", "debit"] as const).map((transactionType) => (
              <button
                key={transactionType}
                type="button"
                aria-pressed={type === transactionType}
                disabled={loading}
                onClick={() => setType(transactionType)}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold capitalize transition ${
                  type === transactionType
                    ? transactionType === "credit"
                      ? "bg-emerald-300/15 text-emerald-200"
                      : "bg-rose-300/15 text-rose-200"
                    : "text-slate-500 hover:text-slate-200"
                }`}
              >
                {transactionType}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="transaction-amount"
            className="mb-2 block text-xs font-semibold text-slate-300"
          >
            Amount (₹)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
              ₹
            </span>
            <input
              id="transaction-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              disabled={loading}
              className="w-full rounded-xl border border-white/10 bg-[#0b111c] py-3 pl-9 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/10 disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="transaction-reference"
            className="mb-2 block text-xs font-semibold text-slate-300"
          >
            Reference ID
          </label>
          <input
            id="transaction-reference"
            type="text"
            value={referenceId}
            onChange={(event) =>
              setReferenceId(event.target.value)
            }
            placeholder="e.g. INV-2048"
            maxLength={100}
            disabled={loading}
            className="w-full rounded-xl border border-white/10 bg-[#0b111c] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/10 disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="transaction-description"
            className="mb-2 block text-xs font-semibold text-slate-300"
          >
            Description <span className="font-normal text-slate-500">· optional</span>
          </label>
          <input
            id="transaction-description"
            type="text"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="What is this transaction for?"
            disabled={loading}
            className="w-full rounded-xl border border-white/10 bg-[#0b111c] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/10 disabled:opacity-50"
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] px-4 py-3 text-sm text-rose-200"
        >
          {error}
        </div>
      )}

      <div className="mt-6">
        <button
          type="submit"
          disabled={
            loading ||
            !amount ||
            !referenceId.trim()
          }
          className="w-full rounded-xl bg-emerald-300 px-5 py-3 text-sm font-bold text-[#07120f] transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading
            ? "Processing..."
            : `Create ${type}`}
        </button>
      </div>
    </form>
  );
}