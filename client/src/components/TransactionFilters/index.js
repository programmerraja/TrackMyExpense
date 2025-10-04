import React, { useState, useEffect, useCallback } from 'react';
import './style.css';

const TransactionFilters = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  transactionCount = 0 
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  }, [localFilters, onFiltersChange]);

  const handleDateRangeChange = useCallback((field, value) => {
    const newDateRange = { ...localFilters.dateRange, [field]: value };
    handleFilterChange('dateRange', newDateRange);
  }, [localFilters.dateRange, handleFilterChange]);

  const handleAmountRangeChange = useCallback((field, value) => {
    const newAmountRange = { ...localFilters.amountRange, [field]: value };
    handleFilterChange('amountRange', newAmountRange);
  }, [localFilters.amountRange, handleFilterChange]);

  const handleSearchChange = useCallback((e) => {
    handleFilterChange('searchText', e.target.value);
  }, [handleFilterChange]);

  const handleTransactionTypeChange = useCallback((e) => {
    handleFilterChange('transactionType', e.target.value);
  }, [handleFilterChange]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters = {
      dateRange: { start: null, end: null },
      searchText: '',
      transactionType: 'all',
      amountRange: { min: null, max: null }
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  }, [onClearFilters]);

  const hasActiveFilters = useCallback(() => {
    return (
      localFilters.dateRange.start ||
      localFilters.dateRange.end ||
      localFilters.searchText ||
      localFilters.transactionType !== 'all' ||
      localFilters.amountRange.min ||
      localFilters.amountRange.max
    );
  }, [localFilters]);

  const formatDateForInput = (date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  const parseDateFromInput = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  return (
    <div className="transaction-filters">
      <div className="filters-header">
        <h3>Filters</h3>
        <div className="filters-info">
          <span className="transaction-count">{transactionCount} transactions</span>
          {hasActiveFilters() && (
            <button 
              className="btn-clear-filters"
              onClick={handleClearFilters}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="filters-content">
        <div className="filter-group search-group">
          <label className="filter-label">Search</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Search in narration..."
            value={localFilters.searchText}
            onChange={handleSearchChange}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Transaction Type</label>
          <select
            className="filter-select"
            value={localFilters.transactionType}
            onChange={handleTransactionTypeChange}
          >
            <option value="all">All Transactions</option>
            <option value="debit">Debit Only</option>
            <option value="credit">Credit Only</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Date Range</label>
          <div className="date-range-inputs">
            <input
              type="date"
              className="filter-input date-input"
              placeholder="Start Date"
              value={formatDateForInput(localFilters.dateRange.start)}
              onChange={(e) => handleDateRangeChange('start', parseDateFromInput(e.target.value))}
            />
            <span className="date-separator">to</span>
            <input
              type="date"
              className="filter-input date-input"
              placeholder="End Date"
              value={formatDateForInput(localFilters.dateRange.end)}
              onChange={(e) => handleDateRangeChange('end', parseDateFromInput(e.target.value))}
            />
          </div>
        </div>

        {/* <div className="filter-group">
          <label className="filter-label">Amount Range</label>
          <div className="amount-range-inputs">
            <input
              type="number"
              className="filter-input amount-input"
              placeholder="Min Amount"
              value={localFilters.amountRange.min || ''}
              onChange={(e) => handleAmountRangeChange('min', e.target.value ? parseFloat(e.target.value) : null)}
              min="0"
              step="0.01"
            />
            <span className="amount-separator">to</span>
            <input
              type="number"
              className="filter-input amount-input"
              placeholder="Max Amount"
              value={localFilters.amountRange.max || ''}
              onChange={(e) => handleAmountRangeChange('max', e.target.value ? parseFloat(e.target.value) : null)}
              min="0"
              step="0.01"
            />
          </div>
        </div> */}
      </div>

      {hasActiveFilters() && (
        <div className="active-filters">
          <h4>Active Filters:</h4>
          <div className="active-filter-tags">
            {localFilters.searchText && (
              <span className="filter-tag">
                Search: "{localFilters.searchText}"
                <button 
                  className="filter-tag-remove"
                  onClick={() => handleFilterChange('searchText', '')}
                >
                  ×
                </button>
              </span>
            )}
            {localFilters.transactionType !== 'all' && (
              <span className="filter-tag">
                Type: {localFilters.transactionType}
                <button 
                  className="filter-tag-remove"
                  onClick={() => handleFilterChange('transactionType', 'all')}
                >
                  ×
                </button>
              </span>
            )}
            {localFilters.dateRange.start && (
              <span className="filter-tag">
                From: {formatDateForInput(localFilters.dateRange.start)}
                <button 
                  className="filter-tag-remove"
                  onClick={() => handleDateRangeChange('start', null)}
                >
                  ×
                </button>
              </span>
            )}
            {localFilters.dateRange.end && (
              <span className="filter-tag">
                To: {formatDateForInput(localFilters.dateRange.end)}
                <button 
                  className="filter-tag-remove"
                  onClick={() => handleDateRangeChange('end', null)}
                >
                  ×
                </button>
              </span>
            )}
            {localFilters.amountRange.min && (
              <span className="filter-tag">
                Min: ₹{localFilters.amountRange.min}
                <button 
                  className="filter-tag-remove"
                  onClick={() => handleAmountRangeChange('min', null)}
                >
                  ×
                </button>
              </span>
            )}
            {localFilters.amountRange.max && (
              <span className="filter-tag">
                Max: ₹{localFilters.amountRange.max}
                <button 
                  className="filter-tag-remove"
                  onClick={() => handleAmountRangeChange('max', null)}
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFilters;
