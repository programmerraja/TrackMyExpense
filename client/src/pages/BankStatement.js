import React, { useState, useCallback } from "react";
import { useBankStatement } from "../hooks/useBankStatement";
import BankStatementUpload from "../components/BankStatementUpload";
import BankStatementDashboard from "../components/BankStatementDashboard";
import TransactionTable from "../components/TransactionTable";
import TransactionFilters from "../components/TransactionFilters";
import StatementCharts from "../components/StatementCharts";
import "./BankStatement.css";

const BankStatement = () => {
  const [currentStatementId, setCurrentStatementId] = useState(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedTransactionsForExpense, setSelectedTransactionsForExpense] =
    useState([]);

  const {
    bankStatement,
    transactions,
    uploadSession,
    filters,
    chartSettings,
    selectedTransactions,
    loading,
    error,
    filteredTransactions,
    summaryData,
    createNewStatement,
    updateStatementStatus,
    setStatementTransactions,
    updateTransaction,
    updateTransactionNarration,
    toggleTransactionSelection,
    selectAllTransactions,
    clearSelection,
    updateFilters,
    clearFilters,
    updateChartSettings,
    setLoadingState,
    setErrorState,
    clearError,
    loadStatementData,
  } = useBankStatement(currentStatementId);

  const handleFileUpload = useCallback(
    (file) => {
      clearError();
      const newStatement = createNewStatement(file);
      setCurrentStatementId(newStatement.id);
      setLoadingState(true);
    },
    [createNewStatement, clearError, setLoadingState]
  );

  const handleFileProcessed = useCallback(
    (statement, parsedTransactions) => {
      setStatementTransactions(parsedTransactions);
      setLoadingState(false);
      updateStatementStatus("completed");
    },
    [setStatementTransactions, setLoadingState, updateStatementStatus]
  );

  const handleFileError = useCallback(
    (errorMessage) => {
      setErrorState(errorMessage);
      updateStatementStatus("failed", errorMessage);
    },
    [setErrorState, updateStatementStatus]
  );

  const handleTransactionUpdate = useCallback(
    (transactionId, updates) => {
      updateTransaction(transactionId, updates);
    },
    [updateTransaction]
  );

  const handleTransactionSelect = useCallback(
    (transactionId) => {
      toggleTransactionSelection(transactionId);
    },
    [toggleTransactionSelection]
  );

  const handleSelectAll = useCallback(() => {
    selectAllTransactions();
  }, [selectAllTransactions]);

  const handleClearSelection = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const handleAddToExpenseTracking = useCallback(() => {
    if (selectedTransactions.length === 0) return;

    // Get selected transaction data
    const selectedTxnData = transactions.filter((txn) =>
      selectedTransactions.includes(txn.id)
    );

    setSelectedTransactionsForExpense(selectedTxnData);
    setShowExpenseForm(true);
  }, [selectedTransactions, transactions]);

  const handleFiltersChange = useCallback(
    (newFilters) => {
      updateFilters(newFilters);
    },
    [updateFilters]
  );

  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  const handleChartSettingsChange = useCallback(
    (newSettings) => {
      updateChartSettings(newSettings);
    },
    [updateChartSettings]
  );

  const handleNewUpload = useCallback(() => {
    setCurrentStatementId(null);
    clearError();
    setShowExpenseForm(false);
    setSelectedTransactionsForExpense([]);
  }, [clearError]);

  const handleCloseExpenseForm = useCallback(() => {
    setShowExpenseForm(false);
    setSelectedTransactionsForExpense([]);
  }, []);

  // If expense form should be shown, we'll need to integrate with existing expense form
  // For now, we'll show a placeholder
  if (showExpenseForm) {
    return (
      <div className="bank-statement-page">
        <div className="expense-form-placeholder">
          <h2>Add to Expense Tracking</h2>
          <p>Selected transactions: {selectedTransactionsForExpense.length}</p>
          <div className="selected-transactions-preview">
            {selectedTransactionsForExpense.map((txn) => (
              <div key={txn.id} className="transaction-preview">
                <span className="txn-date">
                  {new Date(txn.transactionDate).toLocaleDateString()}
                </span>
                <span className="txn-narration">{txn.narration}</span>
                <span className="txn-amount">
                  ₹{txn.debitAmount > 0 ? txn.debitAmount : txn.creditAmount}
                </span>
              </div>
            ))}
          </div>
          <div className="expense-form-actions">
            <button className="btn-cancel" onClick={handleCloseExpenseForm}>
              Cancel
            </button>
            <button
              className="btn-continue"
              onClick={() => {
                // TODO: Open existing expense form with pre-filled data
                console.log(
                  "Opening expense form with data:",
                  selectedTransactionsForExpense
                );
                handleCloseExpenseForm();
              }}
            >
              Continue to Expense Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bank-statement-page">
      <div className="page-header">
        <h1>Bank Statement Visualizer</h1>
        <p>
          Upload and analyze your bank statements with interactive charts and
          filters
        </p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}

      {!bankStatement ? (
        <div className="upload-section">
          <BankStatementUpload
            onFileUpload={handleFileUpload}
            onFileProcessed={handleFileProcessed}
            onError={handleFileError}
            loading={loading}
          />
        </div>
      ) : (
        <div className="statement-analysis">
          <div className="analysis-header">
            <div className="statement-info">
              <h2>{bankStatement.filename}</h2>
              <p>
                Uploaded: {new Date(bankStatement.uploadDate).toLocaleString()}{" "}
                •{bankStatement.totalTransactions} transactions •
                {bankStatement.fileType.toUpperCase()}
              </p>
            </div>
            <button className="btn-new-upload" onClick={handleNewUpload}>
              Upload New Statement
            </button>
          </div>

          <BankStatementDashboard
            summaryData={summaryData}
            selectedTransactions={selectedTransactions}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            onAddToExpenseTracking={handleAddToExpenseTracking}
            loading={loading}
          />
          <StatementCharts
            transactions={filteredTransactions}
            chartSettings={chartSettings}
            onChartSettingsChange={handleChartSettingsChange}
            loading={loading}
          />

          <div className="analysis-content">
            <div className="charts-section">
              <TransactionFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                transactionCount={filteredTransactions.length}
              />
            </div>

            <div className="table-section">
              <TransactionTable
                transactions={filteredTransactions}
                onTransactionUpdate={handleTransactionUpdate}
                onTransactionSelect={handleTransactionSelect}
                selectedTransactions={selectedTransactions}
                loading={loading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankStatement;
