import React, { useState, useEffect, useCallback } from "react";
import API from "../../utils/API";
import Table from "../../components/Table";
import SquareLoader from "../../components/SquareLoader";
import { useToast } from "../../components/Toast";
import { useWorkspace } from "../../context/WorkspaceContext";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { activeWorkspace, activeWorkspaceId } = useWorkspace();

  const handleSearch = useCallback(
    async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const response = await API.searchExpense(
          searchQuery,
          activeWorkspaceId,
        );
        if (response.data.success) {
          setResults(response.data.data);
        } else {
          addToast("Failed to fetch search results", "error");
        }
      } catch (error) {
        addToast("An error occurred during search", "error");
      } finally {
        setLoading(false);
      }
    },
    [addToast, activeWorkspaceId],
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(query);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, handleSearch]);

  const onEdit = (item) => {
    // This could navigate to the specific type page or open the edit modal
    // For now, let's just show a toast since Global Search might span types
    addToast(
      "Edit from search is coming soon! Navigate to the specific category to edit.",
      "info",
    );
  };

  const onDelete = async (id) => {
    try {
      await API.deleteExpense(id);
      addToast("Item deleted successfully", "success");
      setResults(results.filter((item) => item._id !== id));
    } catch (error) {
      addToast("Failed to delete item", "error");
    }
  };

  return (
    <main className="page">
      <SquareLoader loading={loading} msg="Searching..." />

      <header className="mb-5">
        <h1 className="page-title">Search</h1>
        <p className="page-subtitle">
          {activeWorkspace?.name || "Personal"} spending plus global records
        </p>
      </header>

      <div className="relative mb-5">
        <input
          type="search"
          className="field h-12 pr-11 text-base"
          placeholder="Search by name, category, or notes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {query && (
          <button
            className="btn-icon absolute inset-y-0 right-1.5 my-auto"
            onClick={() => setQuery("")}
            aria-label="Clear search"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        )}
      </div>

      {results.length > 0 ? (
        <Table data={results} onEdit={onEdit} onDelete={onDelete} />
      ) : (
        !loading && (
          <div className="card flex flex-col items-center px-6 py-14 text-center">
            <p className="text-4xl">{query.trim() ? "🔍" : "✨"}</p>
            <p className="mt-3 text-lg font-semibold">
              {query.trim() ? "No results found" : "Discover your data"}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {query.trim()
                ? "Try searching for something else"
                : "Enter a keyword to search across all your entries"}
            </p>
          </div>
        )
      )}
    </main>
  );
}
