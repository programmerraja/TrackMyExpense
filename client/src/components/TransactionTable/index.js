import React, { useMemo } from "react";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

export default function TransactionTable({
  transactions = [],
  onTransactionSelect,
  selectedTransactions = [],
  loading = false,
}) {
  const sorted = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate),
      ),
    [transactions],
  );

  if (loading) {
    return <div className="card p-8 text-center text-slate-400">Loading…</div>;
  }

  if (!sorted.length) {
    return (
      <div className="card p-8 text-center text-slate-400">
        No matching transactions
      </div>
    );
  }

  return (
    <section className="card divide-y divide-white/5 overflow-hidden">
      {sorted.map((transaction) => {
        const selected = selectedTransactions.includes(transaction.id);
        const moneyOut = transaction.debitAmount > 0;
        const amount = moneyOut
          ? transaction.debitAmount
          : transaction.creditAmount;

        return (
          <label
            key={transaction.id}
            className={[
              "flex cursor-pointer items-start gap-3 px-4 py-3.5 transition",
              selected ? "bg-brand-500/[0.07]" : "hover:bg-white/[0.025]",
            ].join(" ")}
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onTransactionSelect(transaction.id)}
              className="mt-1 h-4 w-4 shrink-0 accent-brand-500"
            />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium text-slate-200">
                {transaction.narration || "Bank transaction"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {formatDate(transaction.transactionDate)}
                {transaction.referenceNumber
                  ? ` · ${transaction.referenceNumber}`
                  : ""}
              </p>
            </div>
            <p
              className={`shrink-0 text-sm font-bold ${
                moneyOut ? "text-money-out" : "text-money-in"
              }`}
            >
              {moneyOut ? "−" : "+"}₹{amount.toLocaleString("en-IN")}
            </p>
          </label>
        );
      })}
    </section>
  );
}
