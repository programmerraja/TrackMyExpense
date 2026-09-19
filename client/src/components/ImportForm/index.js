import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { CATEGORIES, amountClass, categoryLabel } from "../../constants/expense";
import {
  bucketKey,
  bucketLabel,
  buildImportEntries,
  defaultMatchText,
  findBankMapping,
  isDebtType,
  transactionDirection,
} from "../../utils/bankImport";

const GRANULARITIES = [
  ["month", "one for the month"],
  ["payee", "one per payee"],
  ["transaction", "every transaction"],
];

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// Direction has to be readable without parsing the narration, so every amount
// carries its sign and its colour: red left the account, green came in.
const money = (value) =>
  `${value < 0 ? "−" : "+"}₹${Math.abs(value || 0).toLocaleString("en-IN")}`;

const defaultCategory = (type) =>
  type === "INCOME" ? "salary" : type === "INCOME_TAX" ? "tax" : "other";

const sumOf = (items) => items.reduce((total, item) => total + item.amount, 0);

function makeEntry(transaction, mappings) {
  const direction = transactionDirection(transaction);
  const mapping = findBankMapping(transaction, mappings);
  const matchText =
    mapping?.matchText || defaultMatchText(transaction.narration);
  const type = mapping?.type || (direction === "debit" ? "EXPENSE" : "INCOME");

  return {
    tempId: transaction.id,
    narration: transaction.narration,
    direction,
    matchText,
    assigned: Boolean(mapping),
    known: Boolean(mapping),
    remember: Boolean(mapping),
    selected: true,
    type,
    name: mapping?.name || matchText,
    category: mapping?.category || defaultCategory(type),
    granularity: mapping?.granularity || "month",
    amount:
      direction === "debit"
        ? -Math.abs(transaction.debitAmount)
        : Math.abs(transaction.creditAmount),
    eventDate: transaction.transactionDate,
    bankReference: transaction.referenceNumber || "",
  };
}

const groupPayees = (entries) => {
  const byKey = new Map();
  entries.forEach((entry) => {
    const key = `${entry.direction}:${entry.matchText}`;
    if (!byKey.has(key)) {
      byKey.set(key, { key, matchText: entry.matchText, entries: [] });
    }
    byKey.get(key).entries.push(entry);
  });
  return [...byKey.values()];
};

// The raw bank lines behind a group. Assigned groups get a checkbox per line so
// single transactions can be dropped; unassigned ones are read-only, since
// nothing there is imported until it has a category.
function TransactionList({ entries, onToggle }) {
  return (
    <div className="space-y-1.5">
      {entries.map((entry) => {
        const Row = onToggle ? "label" : "div";

        return (
          <Row
            key={entry.tempId}
            className="flex items-start gap-2 text-xs text-slate-400"
          >
            {onToggle && (
              <input
                type="checkbox"
                checked={entry.selected}
                onChange={() => onToggle(entry.tempId)}
                className="mt-0.5 shrink-0 accent-brand-500"
              />
            )}
            <span className="min-w-0 flex-1">
              <span className="block text-slate-300">
                {formatDate(entry.eventDate)}
              </span>
              <span className="line-clamp-2 break-all">{entry.narration}</span>
            </span>
            <span
              className={`shrink-0 font-semibold ${amountClass(entry.amount)}`}
            >
              {money(entry.amount)}
            </span>
          </Row>
        );
      })}
    </div>
  );
}

function DestinationPicker({ value, onChange, people }) {
  const { type, category, name } = value;

  return (
    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
      <select
        value={type === "SKIP" || isDebtType(type) ? type : "CATEGORY"}
        onChange={(event) => {
          const next = event.target.value;
          if (next === "CATEGORY") {
            onChange({ ...value, type: "EXPENSE", category: category || "food" });
          } else {
            onChange({ ...value, type: next });
          }
        }}
        className="field min-w-0 flex-1 sm:w-auto sm:flex-none"
        aria-label="Destination"
      >
        <option value="CATEGORY">Category</option>
        <option value="DEBT_GIVEN">Lent to a person</option>
        <option value="DEBT_BOUGHT">Borrowed from a person</option>
        <option value="INCOME">Income</option>
        <option value="INCOME_TAX">Tax paid</option>
        <option value="SKIP">Ignore</option>
      </select>

      {!isDebtType(type) && type !== "SKIP" && (
        <select
          value={category}
          onChange={(event) =>
            onChange({ ...value, category: event.target.value })
          }
          className="field min-w-0 flex-1 capitalize sm:w-auto sm:flex-none"
          aria-label="Category"
        >
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {categoryLabel(item)}
            </option>
          ))}
        </select>
      )}

      {isDebtType(type) && (
        <input
          type="text"
          value={name}
          list="import-people"
          onChange={(event) => onChange({ ...value, name: event.target.value })}
          className="field min-w-0 flex-1 sm:w-auto sm:flex-none"
          placeholder="Person's name"
          aria-label="Person's name"
        />
      )}

      <datalist id="import-people">
        {people.map((person) => (
          <option key={person} value={person} />
        ))}
      </datalist>
    </div>
  );
}

function BucketRow({
  bucket,
  rowCount,
  onSetting,
  onUnassign,
  onToggleRemember,
  onToggle,
}) {
  const [open, setOpen] = useState(false);
  const { head, payees, entries, granularity, description } = bucket;
  const total = sumOf(entries.filter((entry) => entry.selected));

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span className="text-xs text-slate-500">{open ? "▾" : "▸"}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold capitalize">
              {bucketLabel(head)}
            </span>
            <span className="mt-0.5 block truncate text-xs text-slate-500">
              {entries.length} txns · {payees.length}{" "}
              {payees.length === 1 ? "payee" : "payees"} · {rowCount}{" "}
              {rowCount === 1 ? "entry" : "entries"}
            </span>
          </span>
        </button>

        <span className={`shrink-0 font-bold ${amountClass(total)}`}>
          {money(total)}
        </span>
      </div>

      {open && (
        <div className="space-y-3 border-t border-white/5 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="shrink-0 text-xs text-slate-400">Create</span>
            <select
              value={granularity}
              onChange={(event) => onSetting("granularity", event.target.value)}
              className="field min-w-0 flex-1 sm:w-auto sm:flex-none"
              aria-label="How many entries to create"
            >
              {GRANULARITIES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            {granularity === "month" && (
              <input
                type="text"
                value={description}
                onChange={(event) => onSetting("description", event.target.value)}
                className="field w-full min-w-0 sm:w-auto sm:flex-1"
                placeholder="Description"
                aria-label="Description"
              />
            )}
          </div>

          <div className="space-y-1">
            {payees.map((payee) => (
              <div
                key={payee.key}
                className="flex items-center gap-2 text-xs text-slate-400"
              >
                <span className="min-w-0 flex-1 truncate">
                  {payee.matchText} · {payee.entries.length}
                </span>
                <span
                  className={`shrink-0 font-semibold ${amountClass(
                    sumOf(payee.entries),
                  )}`}
                >
                  {money(sumOf(payee.entries))}
                </span>
                <button
                  type="button"
                  onClick={() => onToggleRemember(payee)}
                  className={`shrink-0 font-semibold ${
                    payee.entries[0].remember
                      ? "text-slate-500"
                      : "text-money-debt"
                  }`}
                  title={
                    payee.entries[0].remember
                      ? "Saved as a rule for next time"
                      : "This import only"
                  }
                >
                  {payee.entries[0].remember ? "Saved" : "One time"}
                </button>
                <button
                  type="button"
                  onClick={() => onUnassign(payee)}
                  className="shrink-0 font-semibold text-brand-400"
                >
                  Move
                </button>
              </div>
            ))}
          </div>

          <details>
            <summary className="cursor-pointer text-xs font-semibold text-brand-400">
              Transactions
            </summary>
            <div className="mt-2">
              <TransactionList entries={entries} onToggle={onToggle} />
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

function PayeeRow({ payee, checked, onCheck, categories, onAssign }) {
  const [open, setOpen] = useState(false);
  const total = sumOf(payee.entries);

  return (
    <div>
      <div className="flex items-center gap-3 p-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onCheck}
          className="h-4 w-4 shrink-0 accent-brand-500"
          aria-label={`Select ${payee.matchText}`}
        />
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-expanded={open}
        >
          <span className="shrink-0 text-xs text-slate-500">
            {open ? "▾" : "▸"}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">
              {payee.matchText}
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              {payee.entries.length}{" "}
              {payee.entries.length === 1 ? "txn" : "txns"}
            </span>
          </span>
        </button>
        <div className="hidden shrink-0 gap-1 sm:flex">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onAssign(category)}
              className="chip capitalize hover:border-brand-500/40"
            >
              {category}
            </button>
          ))}
        </div>
        <span
          className={`w-24 shrink-0 text-right text-sm font-bold ${amountClass(
            total,
          )}`}
        >
          {money(total)}
        </span>
      </div>

      {open && (
        <div className="border-t border-white/5 px-3 pb-3 pt-2">
          <TransactionList entries={payee.entries} />
        </div>
      )}
    </div>
  );
}

export default function ImportForm({
  transactions,
  mappings,
  mappingsLoading,
  onImport,
  onCancel,
  importStatus,
}) {
  const [entries, setEntries] = useState([]);
  const [settings, setSettings] = useState({});
  const [picked, setPicked] = useState([]);
  const [search, setSearch] = useState("");
  const [remember, setRemember] = useState(true);
  const [draft, setDraft] = useState({
    type: "EXPENSE",
    category: "food",
    name: "",
  });
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (mappingsLoading) return;

    const next = transactions.map((transaction) =>
      makeEntry(transaction, mappings),
    );
    setEntries(next);
    setSettings(
      next.reduce((acc, entry) => {
        if (!entry.assigned) return acc;
        const key = bucketKey(entry);
        if (!acc[key]) {
          acc[key] = {
            granularity: entry.granularity,
            description: bucketLabel(entry),
          };
        }
        return acc;
      }, {}),
    );
  }, [mappings, mappingsLoading, transactions]);

  const people = useMemo(
    () =>
      Array.from(
        new Set(
          mappings.filter((item) => isDebtType(item.type)).map((item) => item.name),
        ),
      ).filter(Boolean),
    [mappings],
  );

  const popularCategories = useMemo(() => {
    const counts = {};
    mappings
      .filter((item) => item.type === "EXPENSE" && item.category)
      .forEach((item) => {
        counts[item.category] = (counts[item.category] || 0) + 1;
      });
    const ranked = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return [...ranked, "food", "bills", "travel", "shopping"]
      .filter((item, index, list) => list.indexOf(item) === index)
      .slice(0, 4);
  }, [mappings]);

  const assigned = entries.filter((entry) => entry.assigned);
  const unassignedPayees = groupPayees(
    entries.filter((entry) => !entry.assigned),
  );

  const buckets = useMemo(() => {
    const byKey = new Map();
    assigned.forEach((entry) => {
      const key = bucketKey(entry);
      if (!byKey.has(key)) {
        byKey.set(key, { key, head: entry, entries: [] });
      }
      byKey.get(key).entries.push(entry);
    });

    return [...byKey.values()].map((bucket) => ({
      ...bucket,
      payees: groupPayees(bucket.entries),
      granularity: settings[bucket.key]?.granularity || "month",
      description: settings[bucket.key]?.description ?? bucketLabel(bucket.head),
    }));
  }, [assigned, settings]);

  const importRows = useMemo(
    () => buildImportEntries(entries, settings),
    [entries, settings],
  );

  const newRuleCount = new Set(
    assigned
      .filter((entry) => entry.remember)
      .map((entry) => `${entry.direction}:${entry.matchText}`),
  ).size;

  const outflow = sumOf(entries.filter((entry) => entry.amount < 0));
  const assignedOutflow = sumOf(assigned.filter((entry) => entry.amount < 0));
  const coverage = outflow ? Math.round((assignedOutflow / outflow) * 100) : 100;

  const visiblePayees = unassignedPayees
    .filter((payee) => payee.matchText.includes(search.trim().toLowerCase()))
    .sort((a, b) => Math.abs(sumOf(b.entries)) - Math.abs(sumOf(a.entries)));

  const assignPayees = (payeeKeys, destination, remember = true) => {
    const keys = new Set(payeeKeys);
    setEntries((current) =>
      current.map((entry) =>
        keys.has(`${entry.direction}:${entry.matchText}`)
          ? {
              ...entry,
              assigned: true,
              remember,
              type: destination.type,
              category: isDebtType(destination.type)
                ? entry.category
                : destination.category,
              name: isDebtType(destination.type)
                ? destination.name
                : entry.matchText,
            }
          : entry,
      ),
    );
    setPicked((current) => current.filter((key) => !keys.has(key)));
  };

  const unassignPayee = (payee) => {
    const keys = new Set(payee.entries.map((entry) => entry.tempId));
    setEntries((current) =>
      current.map((entry) =>
        keys.has(entry.tempId)
          ? { ...entry, assigned: false, remember: false }
          : entry,
      ),
    );
  };

  const toggleRemember = (payee) => {
    const keys = new Set(payee.entries.map((entry) => entry.tempId));
    const next = !payee.entries[0].remember;
    setEntries((current) =>
      current.map((entry) =>
        keys.has(entry.tempId) ? { ...entry, remember: next } : entry,
      ),
    );
  };

  const toggleTransaction = (tempId) => {
    setEntries((current) =>
      current.map((entry) =>
        entry.tempId === tempId
          ? { ...entry, selected: !entry.selected }
          : entry,
      ),
    );
  };

  const setSetting = (key, field, value) =>
    setSettings((current) => ({
      ...current,
      [key]: { ...current[key], [field]: value },
    }));

  const submit = () => {
    const namelessDebt = assigned.find(
      (entry) => isDebtType(entry.type) && !entry.name.trim(),
    );
    if (namelessDebt) {
      setValidationError("Add a name to every person you are tracking.");
      return;
    }

    const rules = new Map();
    assigned.forEach((entry) => {
      if (!entry.remember) return;
      const key = `${entry.direction}:${entry.matchText}`;
      rules.set(key, {
        matchText: entry.matchText,
        direction: entry.direction,
        type: entry.type,
        name: entry.name.trim().toLowerCase(),
        category: entry.category,
        granularity: settings[bucketKey(entry)]?.granularity || "month",
      });
    });

    setValidationError("");
    onImport(importRows, Array.from(rules.values()));
  };

  if (mappingsLoading) {
    return (
      <div className="card p-8 text-center text-slate-400">
        Loading your saved rules…
      </div>
    );
  }

  if (importStatus.inProgress) {
    const completed = importStatus.success + importStatus.duplicates;
    const progress = importStatus.total
      ? (completed / importStatus.total) * 100
      : 100;
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto h-2 max-w-md overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-4 font-semibold">Importing…</p>
        <p className="mt-1 text-sm text-slate-400">
          {completed} of {importStatus.total}
        </p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="page-title">Review statement</h1>
            <p className="page-subtitle">
              {entries.length} transactions · {coverage}% of spending sorted
            </p>
          </div>
          <Link to="/import-rules" className="btn-ghost no-underline">
            Manage rules
          </Link>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${coverage}%` }}
          />
        </div>
      </header>

      {visiblePayees.length > 0 && (
        <section className="mb-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">
              Needs a category
              <span className="ml-2 text-sm font-normal text-slate-400">
                {unassignedPayees.length} payees
              </span>
            </h2>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="field w-full sm:w-56"
              placeholder="Search payee"
              aria-label="Search payee"
            />
          </div>

          <div className="card divide-y divide-white/5">
            {visiblePayees.map((payee) => {
              const checked = picked.includes(payee.key);
              return (
                <PayeeRow
                  key={payee.key}
                  payee={payee}
                  checked={checked}
                  onCheck={() =>
                    setPicked((current) =>
                      checked
                        ? current.filter((key) => key !== payee.key)
                        : [...current, payee.key],
                    )
                  }
                  categories={popularCategories}
                  onAssign={(category) =>
                    assignPayees([payee.key], { type: "EXPENSE", category })
                  }
                />
              );
            })}
          </div>
        </section>
      )}

      {buckets.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">
            Ready
            <span className="ml-2 text-sm font-normal text-slate-400">
              {buckets.length} categories
            </span>
          </h2>
          <div className="space-y-2">
            {buckets.map((bucket) => (
              <BucketRow
                key={bucket.key}
                bucket={bucket}
                rowCount={
                  importRows.filter(
                    (row) =>
                      bucketKey({
                        type: row.type,
                        category: row.category,
                        name: row.name,
                      }) === bucket.key,
                  ).length
                }
                onSetting={(field, value) =>
                  setSetting(bucket.key, field, value)
                }
                onUnassign={unassignPayee}
                onToggleRemember={toggleRemember}
                onToggle={toggleTransaction}
              />
            ))}
          </div>
        </section>
      )}

      {validationError && (
        <p className="mt-4 rounded-xl bg-money-out/10 p-3 text-sm text-money-out">
          {validationError}
        </p>
      )}

      {importStatus.errors.length > 0 && (
        <p className="mt-4 rounded-xl bg-money-out/10 p-3 text-sm text-money-out">
          {importStatus.errors.length} entries failed. Correct them and retry.
        </p>
      )}

      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 mt-5 rounded-2xl border border-white/10 bg-ink-900/95 p-3 backdrop-blur md:bottom-4">
        {picked.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="shrink-0 text-sm font-semibold">
              {picked.length} selected
            </span>
            <DestinationPicker
              value={draft}
              onChange={setDraft}
              people={people}
            />
            <label className="flex shrink-0 items-center gap-2 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember((value) => !value)}
                className="accent-brand-500"
              />
              Remember next time
            </label>
            <button
              type="button"
              onClick={() => assignPayees(picked, draft, remember)}
              className="btn-primary w-full sm:ml-auto sm:w-auto"
            >
              Assign
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button type="button" onClick={onCancel} className="btn-ghost">
              Cancel
            </button>
            <span className="min-w-0 flex-1 truncate text-right text-xs text-slate-500">
              {importRows.length}{" "}
              {importRows.length === 1 ? "entry" : "entries"} · {newRuleCount}{" "}
              {newRuleCount === 1 ? "rule" : "rules"} saved
            </span>
            <button
              type="button"
              onClick={submit}
              disabled={!importRows.length}
              className="btn-primary"
            >
              Import
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
