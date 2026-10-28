interface Account {
  id: number;
  name: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

interface AccountCardProps {
  account: Account;
}

export default function AccountCard({
  account,
}: AccountCardProps) {
  const balance = account.balance / 100;

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Account
          </p>

          <h3 className="mt-2 truncate text-lg font-semibold text-slate-900">
            {account.name}
          </h3>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
          ₹
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Available Balance
        </p>

        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          ₹
          {balance.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs text-slate-400">
          Account ID
        </span>

        <span className="text-xs font-semibold text-slate-600">
          #{account.id}
        </span>
      </div>
    </div>
  );
}