import type { Account } from "../types/api";

interface AccountCardProps {
  account: Account;
  selected: boolean;
  onSelect: () => void;
}

export default function AccountCard({
  account,
  selected,
  onSelect,
}: AccountCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`group w-full rounded-2xl border p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.045] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
        selected
          ? "border-emerald-300/30 bg-emerald-300/[0.06]"
          : "border-white/[0.07] bg-[#131d2b]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Ledger account
          </p>

          <h3 className="mt-2 truncate text-base font-semibold text-slate-100">
            {account.name}
          </h3>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200/10 bg-emerald-200/[0.07] text-sm font-bold text-emerald-200">
          {account.name.slice(0, 1).toUpperCase()}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          Available Balance
        </p>

        <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
          {(account.balance / 100).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
        <span className="text-xs text-slate-500">Account #{account.id}</span>
        <span className="text-xs font-semibold text-emerald-200">
          View activity <span aria-hidden="true">→</span>
        </span>
      </div>
    </button>
  );
}