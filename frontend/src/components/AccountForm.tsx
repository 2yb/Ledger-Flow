import { useState } from "react";
import { createAccount } from "../services/api";

interface AccountFormProps {
  onCreate: () => Promise<void>;
}

export default function AccountForm({
  onCreate,
}: AccountFormProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Account name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createAccount(trimmedName);
      setName("");
      await onCreate();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300/80">
          New ledger
        </p>
        <h2 className="text-xl font-semibold text-white">
          Create an account
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Set up a place to track a balance and its transactions.
        </p>
      </div>

      <label
        htmlFor="account-name"
        className="mb-2 block text-xs font-semibold text-slate-300"
      >
        Account name
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="account-name"
          type="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="e.g. Everyday account"
          maxLength={100}
          disabled={loading}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0b111c] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/10 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="rounded-xl bg-emerald-300 px-5 py-3 text-sm font-bold text-[#07120f] transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Creating..." : "Create account"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] px-4 py-3 text-sm text-rose-200"
        >
          {error}
        </div>
      )}
    </form>
  );
}