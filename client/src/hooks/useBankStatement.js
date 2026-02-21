// React hook for managing bank statement state
// Handles file upload, transaction data, filtering, and session management
import { useState, useEffect, useCallback } from "react";
import {
  saveBankStatement,
  loadBankStatement,
  saveTransactions,
  loadTransactions,
  saveUploadSession,
  loadUploadSession,
  saveFilters,
  loadFilters,
  saveChartData,
  loadChartData,
} from "../utils/sessionStorage";

export const useBankStatement = (statementId = null) => {
  // Core state
  const [bankStatement, setBankStatement] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [uploadSession, setUploadSession] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    searchText: "",
    transactionType: "all",
    amountRange: { min: null, max: null },
  });
  const [chartSettings, setChartSettings] = useState({
    chartType: "bar",
    groupBy: "date",
    timeRange: "monthly",
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [importStatus, setImportStatus] = useState({
    inProgress: false,
    success: 0,
    total: 0,
    errors: [],
  });

  // Load data on mount
  useEffect(() => {
    if (statementId) {
      loadStatementData(statementId);
    }
  }, [statementId]);

  // Save data when it changes
  useEffect(() => {
    if (bankStatement) {
      saveBankStatement(bankStatement);
    }
  }, [bankStatement]);

  useEffect(() => {
    if (transactions.length > 0 && bankStatement) {
      saveTransactions(bankStatement.id, transactions);
    }
  }, [transactions, bankStatement]);

  useEffect(() => {
    if (uploadSession) {
      saveUploadSession(uploadSession);
    }
  }, [uploadSession]);

  useEffect(() => {
    if (bankStatement) {
      saveFilters(bankStatement.id, filters);
    }
  }, [filters, bankStatement]);

  const loadStatementData = useCallback((id) => {
    const statement = loadBankStatement(id);
    if (statement) {
      setBankStatement(statement);
      const loadedTransactions = loadTransactions(id);
      setTransactions(loadedTransactions);

      const session = loadUploadSession(id);
      if (session) {
        setUploadSession(session);
        setSelectedTransactions(session.selectedTransactionIds || []);
      }

      const loadedFilters = loadFilters(id);
      setFilters(loadedFilters);
    }
  }, []);

  const createNewStatement = useCallback((file) => {
    const newStatement = {
      id: `stmt_${Date.now()}`,
      filename: file.name,
      fileSize: file.size,
      fileType: file.name.toLowerCase().endsWith(".csv") ? "csv" : "txt",
      uploadDate: new Date(),
      processingStatus: "uploading",
      errorMessage: null,
      totalTransactions: 0,
    };

    setBankStatement(newStatement);
    setTransactions([]);
    setError(null);

    return newStatement;
  }, []);

  const updateStatementStatus = useCallback(
    (status, errorMessage = null) => {
      if (bankStatement) {
        setBankStatement((prev) => ({
          ...prev,
          processingStatus: status,
          errorMessage,
        }));
      }
    },
    [bankStatement],
  );

  const setStatementTransactions = useCallback(
    (newTransactions) => {
      setTransactions(newTransactions);
      if (bankStatement) {
        setBankStatement((prev) => ({
          ...prev,
          totalTransactions: newTransactions.length,
          processingStatus: "completed",
        }));
      }
    },
    [bankStatement],
  );

  const updateTransaction = useCallback((transactionId, updates) => {
    setTransactions((prev) =>
      prev.map((txn) =>
        txn.id === transactionId ? { ...txn, ...updates } : txn,
      ),
    );
  }, []);

  const updateTransactionNarration = useCallback(
    (transactionId, narration) => {
      updateTransaction(transactionId, { narration });
    },
    [updateTransaction],
  );

  const toggleTransactionSelection = useCallback(
    (transactionId) => {
      setSelectedTransactions((prev) => {
        const isSelected = prev.includes(transactionId);
        const newSelection = isSelected
          ? prev.filter((id) => id !== transactionId)
          : [...prev, transactionId];

        // Update upload session
        if (bankStatement) {
          const newSession = {
            id: `session_${Date.now()}`,
            bankStatementId: bankStatement.id,
            selectedTransactionIds: newSelection,
            filters,
            chartSettings,
          };
          setUploadSession(newSession);
        }

        return newSelection;
      });
    },
    [bankStatement, filters, chartSettings],
  );

  const selectAllTransactions = useCallback(() => {
    const allIds = transactions.map((txn) => txn.id);
    setSelectedTransactions(allIds);

    if (bankStatement) {
      const newSession = {
        id: `session_${Date.now()}`,
        bankStatementId: bankStatement.id,
        selectedTransactionIds: allIds,
        filters,
        chartSettings,
      };
      setUploadSession(newSession);
    }
  }, [transactions, bankStatement, filters, chartSettings]);

  const clearSelection = useCallback(() => {
    setSelectedTransactions([]);

    if (bankStatement) {
      const newSession = {
        id: `session_${Date.now()}`,
        bankStatementId: bankStatement.id,
        selectedTransactionIds: [],
        filters,
        chartSettings,
      };
      setUploadSession(newSession);
    }
  }, [bankStatement, filters, chartSettings]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      dateRange: { start: null, end: null },
      searchText: "",
      transactionType: "all",
      amountRange: { min: null, max: null },
    });
  }, []);

  const updateChartSettings = useCallback((newSettings) => {
    setChartSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const getFilteredTransactions = useCallback(() => {
    return transactions.filter((txn) => {
      // Date range filter
      if (
        filters.dateRange.start &&
        txn.transactionDate < filters.dateRange.start
      ) {
        return false;
      }
      if (
        filters.dateRange.end &&
        txn.transactionDate > filters.dateRange.end
      ) {
        return false;
      }

      // Search text filter
      if (
        filters.searchText &&
        !txn.narration.toLowerCase().includes(filters.searchText.toLowerCase())
      ) {
        return false;
      }

      // Transaction type filter
      if (filters.transactionType === "debit" && txn.debitAmount <= 0) {
        return false;
      }
      if (filters.transactionType === "credit" && txn.creditAmount <= 0) {
        return false;
      }

      // Amount range filter
      const amount = txn.debitAmount > 0 ? txn.debitAmount : txn.creditAmount;
      if (filters.amountRange.min && amount < filters.amountRange.min) {
        return false;
      }
      if (filters.amountRange.max && amount > filters.amountRange.max) {
        return false;
      }

      return true;
    });
  }, [transactions, filters]);

  const getSummaryData = useCallback(() => {
    const filteredTxs = getFilteredTransactions();

    const totalIncome = filteredTxs.reduce(
      (sum, txn) => sum + txn.creditAmount,
      0,
    );
    const totalExpenses = filteredTxs.reduce(
      (sum, txn) => sum + txn.debitAmount,
      0,
    );
    const netAmount = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      netAmount,
      totalTransactions: filteredTxs.length,
      selectedCount: selectedTransactions.length,
    };
  }, [getFilteredTransactions, selectedTransactions]);

  const setLoadingState = useCallback((isLoading) => {
    setLoading(isLoading);
  }, []);

  const setErrorState = useCallback((errorMessage) => {
    setError(errorMessage);
    setLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const importTransactions = useCallback(async (mappedExpenses, onComplete) => {
    setImportStatus({
      inProgress: true,
      success: 0,
      total: mappedExpenses.length,
      errors: [],
    });

    let successCount = 0;
    const errors = [];

    const API_MOD = await import("../utils/API");
    const API = API_MOD.default;

    for (const expense of mappedExpenses) {
      try {
        const { tempId, ...expenseData } = expense;
        await API.addExpense(expenseData);
        successCount++;
        setImportStatus((prev) => ({ ...prev, success: successCount }));
      } catch (err) {
        errors.push({
          name: expense.name,
          error: err.response?.data?.error || err.message,
        });
      }
    }

    setImportStatus((prev) => ({
      ...prev,
      inProgress: false,
      errors,
    }));

    if (onComplete) {
      onComplete({
        success: successCount,
        total: mappedExpenses.length,
        errors,
      });
    }
  }, []);

  return {
    // State
    bankStatement,
    transactions,
    uploadSession,
    filters,
    chartSettings,
    selectedTransactions,
    loading,
    error,
    importStatus,

    // Computed values
    filteredTransactions: getFilteredTransactions(),
    summaryData: getSummaryData(),

    // Actions
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
    importTransactions,
  };
};
