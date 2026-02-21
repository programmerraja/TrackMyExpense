import React, { useState, useEffect, useCallback } from "react";
import API from "../../utils/API";
import Table from "../../components/Table";
import SquareLoader from "../../components/SquareLoader";
import { useToast } from "../../components/Toast";
import "./style.css";

const HEADING = ["name", "amount", "category", "type", "eventDate"];

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSearch = useCallback(
    async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const response = await API.searchExpense(searchQuery);
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
    [addToast],
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
    <div className="searchPage">
      <SquareLoader loading={loading} msg="Searching..." />
      <div className="searchHeader">
        <h1>Global Search</h1>
        <div className="searchInputWrapper">
          <i className="fa-solid fa-magnifying-glass searchIcon"></i>
          <input
            type="text"
            placeholder="Search by name, category, or notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button className="clearSearch" onClick={() => setQuery("")}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      </div>

      <div className="searchResults">
        {results.length > 0 ? (
          <Table
            heading={HEADING}
            data={results}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ) : query.trim() && !loading ? (
          <div className="emptyState">
            <div className="emptyStateIcon">🔍</div>
            <p className="emptyStateTitle">No results found</p>
            <p className="emptyStateSubtitle">
              Try searching for something else
            </p>
          </div>
        ) : (
          !loading && (
            <div className="searchPlaceholder">
              <div className="emptyStateIcon">✨</div>
              <p className="emptyStateTitle">Discover your data</p>
              <p className="emptyStateSubtitle">
                Enter a keyword to search across all your entries
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
