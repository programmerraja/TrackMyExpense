import React from "react";

import { amountClass } from "../../constants/expense";

const TYPE_LABELS = {
  INCOME: "Income",
  EXPENSE: "Expense",
  DEBT_BOUGHT: "Borrowed",
  DEBT_GIVEN: "Lent",
  INVESTMENT: "Investment",
  INCOME_TAX: "Tax",
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const EditIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
  >
    <path d="m4 20 4.2-1 10.5-10.5a2.1 2.1 0 0 0-3-3L5.2 16Z" />
    <path d="m14.5 6.5 3 3" />
  </svg>
);

const TrashIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
  >
    <path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6" />
  </svg>
);

export default function Table({ data, onEdit, onDelete }) {
  const handleDelete = (entry) => {
    if (window.confirm(`Delete “${entry.name}” for ₹${Math.abs(entry.amount)}?`)) {
      onDelete(entry._id);
    }
  };

  return (
    <section className="card overflow-hidden">
      <div className="border-b border-white/5 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-200">
          {data.length} {data.length === 1 ? "entry" : "entries"}
        </h2>
      </div>

      <div className="divide-y divide-white/5">
        {data.map((entry, index) => (
          <article
            key={entry._id || index}
            className="flex items-start gap-3 px-4 py-3.5 transition hover:bg-white/[0.025]"
          >
            <div
              className={[
                "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                entry.amount < 0
                  ? "bg-money-out/10 text-money-out"
                  : "bg-money-in/10 text-money-in",
              ].join(" ")}
            >
              {(entry.name || "?").charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold capitalize text-slate-100">
                    {entry.name || "Untitled"}
                    {entry.isRecurring && (
                      <span
                        className="ml-2 text-xs text-brand-400"
                        title={`Recurring ${entry.recurringFrequency || "monthly"}`}
                      >
                        ↻
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {entry.eventDate ? formatDate(entry.eventDate) : ""}
                    {entry.category ? ` · ${entry.category}` : ""}
                    {entry.type ? ` · ${TYPE_LABELS[entry.type] || entry.type}` : ""}
                  </p>
                </div>
                <p className={`shrink-0 font-bold ${amountClass(entry.amount)}`}>
                  {entry.amount < 0 ? "−" : "+"}₹
                  {Math.abs(entry.amount).toLocaleString("en-IN")}
                </p>
              </div>

              {(entry.note || entry.vault) && (
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="line-clamp-2 text-sm text-slate-400">
                    {entry.note || ""}
                  </p>
                  {entry.vault && entry.vault !== "primary" && (
                    <span className="shrink-0 rounded-full bg-money-tax/10 px-2 py-0.5 text-[10px] font-semibold capitalize text-money-tax">
                      {entry.vault}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => onEdit(entry)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white/10 hover:text-slate-200"
                aria-label={`Edit ${entry.name}`}
              >
                <EditIcon />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(entry)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-money-out/10 hover:text-money-out"
                aria-label={`Delete ${entry.name}`}
              >
                <TrashIcon />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
