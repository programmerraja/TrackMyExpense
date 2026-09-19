import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import SquareLoader from "../../components/SquareLoader";
import { useToast } from "../../components/Toast";
import { CATEGORIES, categoryLabel } from "../../constants/expense";
import API from "../../utils/API";
import { isDebtType } from "../../utils/bankImport";

const TYPE_LABELS = {
  EXPENSE: "Expense",
  INCOME: "Income",
  INCOME_TAX: "Tax paid",
  DEBT_GIVEN: "Lent to",
  DEBT_BOUGHT: "Borrowed from",
  SKIP: "Ignored",
};

const GRANULARITY_LABELS = {
  month: "one for the month",
  payee: "one per payee",
  transaction: "every transaction",
};

const destinationOf = (rule) =>
  rule.type === "SKIP"
    ? "Ignored"
    : isDebtType(rule.type)
      ? `${TYPE_LABELS[rule.type]} ${rule.name}`
      : categoryLabel(rule.category);

function RuleForm({ rule, onCancel, onSave }) {
  const [draft, setDraft] = useState(rule);
  const [saving, setSaving] = useState(false);

  const update = (field, value) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const ok = await onSave(rule, draft);
    if (!ok) setSaving(false);
  };

  return (
    <form onSubmit={submit} className="space-y-3 p-4">
      <div>
        <label htmlFor={`match-${rule._id}`} className="label">
          When the narration contains
        </label>
        <input
          id={`match-${rule._id}`}
          type="text"
          value={draft.matchText}
          onChange={(event) => update("matchText", event.target.value)}
          className="field"
          required
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`type-${rule._id}`} className="label">
            Becomes
          </label>
          <select
            id={`type-${rule._id}`}
            value={draft.type}
            onChange={(event) => update("type", event.target.value)}
            className="field"
          >
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {draft.type !== "SKIP" && !isDebtType(draft.type) && (
          <div>
            <label htmlFor={`category-${rule._id}`} className="label">
              Category
            </label>
            <select
              id={`category-${rule._id}`}
              value={draft.category}
              onChange={(event) => update("category", event.target.value)}
              className="field capitalize"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {categoryLabel(category)}
                </option>
              ))}
            </select>
          </div>
        )}

        {isDebtType(draft.type) && (
          <div>
            <label htmlFor={`name-${rule._id}`} className="label">
              Person
            </label>
            <input
              id={`name-${rule._id}`}
              type="text"
              value={draft.name}
              onChange={(event) => update("name", event.target.value)}
              className="field"
              required
            />
          </div>
        )}
      </div>

      {draft.type !== "SKIP" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {!isDebtType(draft.type) && (
            <div>
              <label htmlFor={`description-${rule._id}`} className="label">
                Description
              </label>
              <input
                id={`description-${rule._id}`}
                type="text"
                value={draft.name}
                onChange={(event) => update("name", event.target.value)}
                className="field"
                placeholder="Shows as the entry name"
              />
            </div>
          )}
          <div>
            <label htmlFor={`granularity-${rule._id}`} className="label">
              Creates
            </label>
            <select
              id={`granularity-${rule._id}`}
              value={draft.granularity}
              onChange={(event) => update("granularity", event.target.value)}
              className="field"
            >
              {Object.entries(GRANULARITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-white/5 pt-3">
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

function RuleRow({ rule, editing, onEdit, onCancel, onSave, onDelete }) {
  if (editing) {
    return <RuleForm rule={rule} onCancel={onCancel} onSave={onSave} />;
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{rule.matchText}</p>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {rule.direction === "debit" ? "Money out" : "Money in"}
          {rule.type === "SKIP"
            ? ""
            : ` · ${GRANULARITY_LABELS[rule.granularity] || "one for the month"}`}
        </p>
      </div>

      <div className="flex shrink-0 gap-1">
        <button type="button" onClick={onEdit} className="btn-ghost">
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="btn-ghost text-money-out"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function Mappings() {
  const { addToast } = useToast();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    API.getBankMappings()
      .then((response) => setRules(response.data.data || []))
      .catch(() => addToast("Could not load import rules", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (original, draft) => {
    try {
      await API.saveBankMapping({
        matchText: draft.matchText,
        direction: draft.direction,
        type: draft.type,
        name: draft.name,
        category: draft.category,
        granularity: draft.granularity,
      });

      // The rule is keyed by its match text, so renaming it creates a new one
      // and the old key has to go or both would match next import.
      if (draft.matchText.trim() !== original.matchText) {
        await API.deleteBankMapping(original._id);
      }

      addToast("Rule saved", "success");
      setEditingId(null);
      load();
      return true;
    } catch (err) {
      addToast("Could not save rule", "error");
      return false;
    }
  };

  const remove = (rule) => {
    API.deleteBankMapping(rule._id)
      .then(() => {
        addToast("Rule deleted", "success");
        setRules((current) => current.filter((item) => item._id !== rule._id));
      })
      .catch(() => addToast("Could not delete rule", "error"));
  };

  const groups = useMemo(() => {
    const term = search.trim().toLowerCase();
    const byDestination = new Map();

    rules
      .filter(
        (rule) =>
          !term ||
          rule.matchText.includes(term) ||
          (rule.category || "").includes(term) ||
          (rule.name || "").includes(term),
      )
      .forEach((rule) => {
        const key = destinationOf(rule);
        if (!byDestination.has(key)) byDestination.set(key, []);
        byDestination.get(key).push(rule);
      });

    return [...byDestination.entries()].sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
  }, [rules, search]);

  return (
    <>
      <SquareLoader loading={loading} msg="Loading rules..." />

      <main className="page">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="page-title">Import rules</h1>
            <p className="page-subtitle">
              What each bank payee turns into when you import a statement
            </p>
          </div>
          <Link to="/bank-statement" className="btn-ghost no-underline">
            Import a statement
          </Link>
        </header>

        {rules.length > 0 && (
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="field mb-4 sm:max-w-xs"
            placeholder="Search payee or category"
            aria-label="Search rules"
          />
        )}

        {!loading && rules.length === 0 && (
          <div className="card p-10 text-center">
            <p className="font-semibold">No rules yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">
              Import a bank statement and the categories you choose are saved
              here, so the next statement sorts itself.
            </p>
            <Link to="/bank-statement" className="btn-primary mt-4 no-underline">
              Import a statement
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {groups.map(([destination, items]) => (
            <section key={destination} className="card overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-3">
                <h2 className="truncate font-semibold capitalize">
                  {destination}
                </h2>
                <span className="shrink-0 text-xs text-slate-500">
                  {items.length} {items.length === 1 ? "payee" : "payees"}
                </span>
              </div>

              <div className="divide-y divide-white/5">
                {items.map((rule) => (
                  <RuleRow
                    key={rule._id}
                    rule={rule}
                    editing={editingId === rule._id}
                    onEdit={() => setEditingId(rule._id)}
                    onCancel={() => setEditingId(null)}
                    onSave={save}
                    onDelete={() => remove(rule)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
