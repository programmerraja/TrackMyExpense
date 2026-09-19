import React, { useEffect, useRef, useState } from "react";

import API from "../../utils/API";
import { useToast } from "../Toast";
import {
  EMERGENCY_CATEGORY,
  EMERGENCY_VAULT,
  EXPENSE_TYPE,
  WORKSPACE_SCOPED_TYPES,
} from "../../constants/expense";
import { useWorkspace } from "../../context/WorkspaceContext";

const TYPE_OPTIONS = [
  { value: EXPENSE_TYPE.EXPENSE, label: "Spent" },
  { value: EXPENSE_TYPE.INCOME, label: "Got money" },
  { value: EXPENSE_TYPE.DEBT_GIVEN, label: "Lent / paid back" },
  { value: EXPENSE_TYPE.DEBT_BOUGHT, label: "Borrowed / received back" },
  { value: EXPENSE_TYPE.INCOME_TAX, label: "Paid tax" },
  { value: EXPENSE_TYPE.INVESTMENT, label: "Invested" },
];

const CATEGORIES = [
  ["Everyday", [
    ["food", "Food"],
    ["bills", "Bills"],
    ["rent", "Rent"],
    ["travel", "Travel"],
    ["medical", "Medical"],
    ["shopping", "Shopping"],
  ]],
  ["Other", [
    ["home", "Sent home"],
    ["entertainment", "Entertainment"],
    ["friends", "Friends"],
    ["sports", "Sports"],
    ["salary", "Salary"],
    ["savings", "Savings"],
    ["emergency", "Emergency fund"],
    ["stock", "Stock"],
    ["tax", "Tax"],
    ["other", "Other"],
  ]],
];

const EMPTY_ENTRY = {
  type: EXPENSE_TYPE.EXPENSE,
  name: "",
  amount: 0,
  eventDate: new Date().toISOString().substring(0, 10),
  category: "food",
  note: "",
  vault: "primary",
  isRecurring: false,
  recurringFrequency: "monthly",
};

const fieldLabel = "label";

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function CategorySelect({ value, onChange }) {
  return (
    <select
      id="category"
      value={value}
      onChange={onChange}
      className="field capitalize"
    >
      {CATEGORIES.map(([group, options]) => (
        <optgroup key={group} label={group}>
          {options.map(([optionValue, label]) => (
            <option key={optionValue} value={optionValue}>
              {label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

export function Form({
  setShow,
  propsState,
  setAPICall,
  nameSuggestions,
  onAddSuccess,
}) {
  const { addToast } = useToast();
  const { activeWorkspaceId } = useWorkspace();
  const [state, setState] = useState(EMPTY_ENTRY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const isEditing = Boolean(propsState.isEdit);
  const isTypeLocked =
    propsState.type &&
    propsState.type !== EXPENSE_TYPE.DASHBOARD &&
    propsState.type !== EXPENSE_TYPE.DEBT &&
    !isEditing;

  useEffect(() => {
    setState({
      ...EMPTY_ENTRY,
      ...propsState,
      type:
        propsState.type === EXPENSE_TYPE.DEBT
          ? EXPENSE_TYPE.DEBT_GIVEN
          : propsState.type || EMPTY_ENTRY.type,
      eventDate: propsState.eventDate
        ? new Date(propsState.eventDate).toISOString().substring(0, 10)
        : EMPTY_ENTRY.eventDate,
    });
    // Open the extra fields when the entry already uses one, so editing never
    // hides a value the user set earlier.
    setShowMore(
      Boolean(
        propsState.note ||
          propsState.isRecurring ||
          (propsState.vault && propsState.vault !== "primary"),
      ),
    );
  }, [propsState]);

  const handleChange = (event) => {
    const { id, value } = event.target;
    setState((current) => ({ ...current, [id]: value }));
    if (errors[id]) {
      setErrors((current) => ({ ...current, [id]: null }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!state.name.trim()) nextErrors.name = "Add a short description";
    if (!state.amount || Number(state.amount) === 0) {
      nextErrors.amount = "Amount must be more than zero";
    }
    if (!state.eventDate) nextErrors.eventDate = "Choose a date";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const signedAmount = () => {
    const amount = Math.abs(Number(state.amount));
    return [EXPENSE_TYPE.INCOME, EXPENSE_TYPE.DEBT_BOUGHT].includes(state.type)
      ? amount
      : -amount;
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    API.addExpense({
      ...state,
      ...(WORKSPACE_SCOPED_TYPES.includes(state.type) && activeWorkspaceId
        ? { workspaceId: activeWorkspaceId }
        : {}),
      amount: signedAmount(),
      // The category is the switch the user actually sees, so it decides the
      // account: money filed under Emergency fund has to sit in that pot even
      // when the folded-away Account field still reads Spendable.
      vault:
        state.category === EMERGENCY_CATEGORY ? EMERGENCY_VAULT : state.vault,
      name: state.name.trim().toLowerCase(),
      note: state.note.trim(),
    })
      .then((response) => {
        const savedEntry = response.data.data || response.data;
        addToast(isEditing ? "Entry updated" : "Entry added", "success");
        if (!isEditing && onAddSuccess) onAddSuccess(savedEntry);
        setShow();
        setAPICall((value) => !value);
      })
      .catch(() => {
        addToast(
          isEditing ? "Could not update entry" : "Could not add entry",
          "error",
        );
        setSaving(false);
      });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={setShow}
      role="presentation"
    >
      <section
        className="max-h-[88vh] w-full overflow-y-auto rounded-t-2xl border border-white/10 bg-ink-900 p-4 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-5"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-form-title"
      >
        <header className="mb-4 flex items-center justify-between">
          <h2 id="entry-form-title" className="text-base font-bold">
            {isEditing ? "Edit entry" : "Add entry"}
          </h2>
          <button
            type="button"
            onClick={setShow}
            className="btn-icon"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </header>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label htmlFor="type" className={fieldLabel}>
              Action
            </label>
            <select
              id="type"
              value={state.type}
              onChange={handleChange}
              disabled={isTypeLocked}
              className="field disabled:cursor-not-allowed disabled:opacity-60"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="name" className={fieldLabel}>
              {state.type === EXPENSE_TYPE.DEBT_GIVEN ||
              state.type === EXPENSE_TYPE.DEBT_BOUGHT
                ? "Person"
                : "Description"}
            </label>
            <input
              type="text"
              id="name"
              placeholder={
                state.type === EXPENSE_TYPE.EXPENSE
                  ? "Groceries, rent, recharge…"
                  : "Name or source"
              }
              value={state.name}
              onChange={handleChange}
              list="entry-name-options"
              className={`field ${errors.name ? "border-money-out" : ""}`}
              autoFocus
            />
            {errors.name && (
              <p className="mt-1 text-xs text-money-out">{errors.name}</p>
            )}
            <datalist id="entry-name-options">
              {(nameSuggestions || []).map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <label htmlFor="amount" className={fieldLabel}>
                Amount
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
                  ₹
                </span>
                <input
                  type="number"
                  id="amount"
                  inputMode="decimal"
                  placeholder="0"
                  value={Math.abs(state.amount) || ""}
                  onChange={handleChange}
                  min="0"
                  className={`field pl-7 ${
                    errors.amount ? "border-money-out" : ""
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-xs text-money-out">{errors.amount}</p>
              )}
            </div>

            <div className="min-w-0">
              <label htmlFor="eventDate" className={fieldLabel}>
                Date
              </label>
              <input
                type="date"
                id="eventDate"
                value={state.eventDate}
                onChange={handleChange}
                className={`field min-w-0 px-2 ${
                  errors.eventDate ? "border-money-out" : ""
                }`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="category" className={fieldLabel}>
              Category
            </label>
            <CategorySelect value={state.category} onChange={handleChange} />
          </div>

          {/* Account, repeat and note are rarely changed, so they stay folded
              away to keep the sheet short on a phone. */}
          <button
            type="button"
            onClick={() => setShowMore((open) => !open)}
            className="flex w-full items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08]"
          >
            More options
            <span className="text-slate-500">{showMore ? "−" : "+"}</span>
          </button>

          {showMore && (
            <div className="space-y-3">
              <div>
                <label htmlFor="vault" className={fieldLabel}>
                  Account
                </label>
                <select
                  id="vault"
                  value={state.vault || "primary"}
                  onChange={handleChange}
                  className="field"
                >
                  <option value="primary">Spendable</option>
                  <option value="emergency">Emergency fund</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2.5">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={state.isRecurring}
                    onChange={(event) =>
                      setState((current) => ({
                        ...current,
                        isRecurring: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-white/20 accent-brand-500"
                  />
                  Repeat automatically
                </label>
                {state.isRecurring && (
                  <select
                    id="recurringFrequency"
                    value={state.recurringFrequency}
                    onChange={handleChange}
                    className="field !h-8 !w-auto text-sm"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                )}
              </div>

              <div>
                <label htmlFor="note" className={fieldLabel}>
                  Note{" "}
                  <span className="font-normal text-slate-600">optional</span>
                </label>
                <textarea
                  id="note"
                  rows="2"
                  placeholder="Anything worth remembering"
                  value={state.note}
                  onChange={handleChange}
                  className="field resize-none"
                />
              </div>
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving…" : isEditing ? "Save changes" : "Add entry"}
          </button>
        </form>
      </section>
    </div>
  );
}

export function AddButton({
  show,
  setShowFrom,
  editData,
  type,
  setAPICall,
  nameSuggestions,
  onAddSuccess,
}) {
  const addingNew = useRef(false);

  useEffect(() => {
    if (!show) addingNew.current = false;
  }, [show]);

  const openNew = () => {
    addingNew.current = true;
    setShowFrom(true);
  };

  const initialState =
    !addingNew.current && editData
      ? {
          ...editData,
          eventDate: editData.eventDate || new Date().toISOString(),
        }
      : {
          ...EMPTY_ENTRY,
          type: type !== EXPENSE_TYPE.DASHBOARD ? type : EXPENSE_TYPE.EXPENSE,
        };

  return (
    <>
      <button
        type="button"
        onClick={openNew}
        className={[
          "fixed z-40 flex h-14 w-14 items-center justify-center rounded-2xl",
          "bg-brand-500 text-white shadow-lg shadow-brand-500/30",
          "transition hover:bg-brand-600 active:scale-95",
          "bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4",
          "md:bottom-6 md:right-6",
        ].join(" ")}
        aria-label="Add entry"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-6 w-6"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {show && (
        <Form
          setShow={() => setShowFrom(false)}
          propsState={initialState}
          setAPICall={setAPICall}
          nameSuggestions={nameSuggestions}
          onAddSuccess={onAddSuccess}
        />
      )}
    </>
  );
}
