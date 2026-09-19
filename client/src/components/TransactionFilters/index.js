import React from "react";

export default function TransactionFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  transactionCount = 0,
}) {
  const update = (key, value) =>
    onFiltersChange({ ...filters, [key]: value });

  const active =
    filters.searchText || filters.transactionType !== "all";

  return (
    <div className="card grid gap-2 p-3 sm:grid-cols-[1fr_180px_auto]">
      <input
        type="search"
        className="field"
        placeholder={`Search ${transactionCount} transactions`}
        value={filters.searchText}
        onChange={(event) => update("searchText", event.target.value)}
      />
      <select
        className="field"
        value={filters.transactionType}
        onChange={(event) => update("transactionType", event.target.value)}
      >
        <option value="all">All transactions</option>
        <option value="debit">Money out</option>
        <option value="credit">Money in</option>
      </select>
      {active && (
        <button type="button" onClick={onClearFilters} className="btn-ghost">
          Clear
        </button>
      )}
    </div>
  );
}
