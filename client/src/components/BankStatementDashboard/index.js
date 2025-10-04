import React from 'react';
import './style.css';

const BankStatementDashboard = ({ 
  summaryData = {},
  selectedTransactions = [],
  onSelectAll,
  onClearSelection,
  onAddToExpenseTracking,
  loading = false 
}) => {
  const {
    totalIncome = 0,
    totalExpenses = 0,
    netAmount = 0,
    totalTransactions = 0,
    selectedCount = 0
  } = summaryData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getNetAmountClass = (amount) => {
    if (amount > 0) return 'positive';
    if (amount < 0) return 'negative';
    return 'neutral';
  };

  const getNetAmountIcon = (amount) => {
    if (amount > 0) return '↗';
    if (amount < 0) return '↘';
    return '→';
  };

  if (loading) {
    return (
      <div className="bank-statement-dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bank-statement-dashboard">
      <div className="dashboard-header">
        <h2>Bank Statement Summary</h2>
        <div className="dashboard-actions">
          {selectedCount > 0 && (
            <>
              <button 
                className="btn-clear-selection"
                onClick={onClearSelection}
              >
                Clear Selection ({selectedCount})
              </button>
              <button 
                className="btn-add-to-expense"
                onClick={onAddToExpenseTracking}
              >
                Add to Expense Tracking
              </button>
            </>
          )}
          {selectedCount === 0 && totalTransactions > 0 && (
            <button 
              className="btn-select-all"
              onClick={onSelectAll}
            >
              Select All Transactions
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        <div className="summary-cards">
          <div className="summary-card income">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className="card-content">
              <h3>Total Income</h3>
              <p className="card-amount income-amount">
                {formatCurrency(totalIncome)}
              </p>
              <p className="card-description">
                {totalTransactions > 0 ? 
                  `${Math.round((totalIncome / (totalIncome + totalExpenses)) * 100)}% of total` : 
                  'No transactions'
                }
              </p>
            </div>
          </div>

          <div className="summary-card expenses">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M6 5h5.5a3.5 3.5 0 0 1 0 7H6M6 12h5.5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className="card-content">
              <h3>Total Expenses</h3>
              <p className="card-amount expenses-amount">
                {formatCurrency(totalExpenses)}
              </p>
              <p className="card-description">
                {totalTransactions > 0 ? 
                  `${Math.round((totalExpenses / (totalIncome + totalExpenses)) * 100)}% of total` : 
                  'No transactions'
                }
              </p>
            </div>
          </div>

          <div className="summary-card net">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18M7 12l4-4 4 4 6-6"></path>
              </svg>
            </div>
            <div className="card-content">
              <h3>Net Amount</h3>
              <p className={`card-amount net-amount ${getNetAmountClass(netAmount)}`}>
                <span className="net-icon">{getNetAmountIcon(netAmount)}</span>
                {formatCurrency(Math.abs(netAmount))}
              </p>
              <p className="card-description">
                {netAmount > 0 ? 'Surplus' : netAmount < 0 ? 'Deficit' : 'Balanced'}
              </p>
            </div>
          </div>

          <div className="summary-card transactions">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"></path>
              </svg>
            </div>
            <div className="card-content">
              <h3>Transactions</h3>
              <p className="card-amount transactions-count">
                {totalTransactions.toLocaleString()}
              </p>
              <p className="card-description">
                {selectedCount > 0 ? `${selectedCount} selected` : 'Total count'}
              </p>
            </div>
          </div>
        </div>

        {totalTransactions > 0 && (
          <div className="dashboard-insights">
            <h3>Quick Insights</h3>
            <div className="insights-grid">
              <div className="insight-item">
                <span className="insight-label">Average Transaction:</span>
                <span className="insight-value">
                  {formatCurrency((totalIncome + totalExpenses) / totalTransactions)}
                </span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Largest Income:</span>
                <span className="insight-value">
                  {formatCurrency(totalIncome)}
                </span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Largest Expense:</span>
                <span className="insight-value">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Savings Rate:</span>
                <span className="insight-value">
                  {totalIncome > 0 ? 
                    `${Math.round((netAmount / totalIncome) * 100)}%` : 
                    'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        )}

        {selectedCount > 0 && (
          <div className="selection-summary">
            <h3>Selected Transactions</h3>
            <p>
              {selectedCount} transaction{selectedCount !== 1 ? 's' : ''} selected for expense tracking.
              Click "Add to Expense Tracking" to open the expense form with pre-filled data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankStatementDashboard;
