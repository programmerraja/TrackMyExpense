import { useState, useEffect, useCallback, useMemo } from "react";
import API from "../utils/API";
import { useWorkspace } from "../context/WorkspaceContext";
import {
  saveBankStatement,
  loadBankStatement,
  saveTransactions,
  loadTransactions,
  saveUploadSession,
  loadUploadSession,
  saveFilters,
  loadFilters,
  clearStatementData,
} from "../utils/sessionStorage";

const EMPTY_FILTERS = {
  dateRange: { start: null, end: null },
  searchText: "",
  transactionType: "all",
  amountRange: { min: null, max: null },
};

export const useBankStatement = (statementId = null) => {
  const { activeWorkspaceId } = useWorkspace();
  const [bankStatement, setBankStatement] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [uploadSession, setUploadSession] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [mappingsLoading, setMappingsLoading] = useState(true);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [importStatus, setImportStatus] = useState({
    inProgress: false,
    success: 0,
    duplicates: 0,
    total: 0,
    errors: [],
  });

  useEffect(() => {
    API.getBankMappings()
      .then((response) => setMappings(response.data.data || []))
      .catch(() => setError("Could not load your saved bank mappings."))
      .finally(() => setMappingsLoading(false));
  }, []);

  useEffect(() => {
    if (!statementId) return;
    const statement = loadBankStatement(statementId);
    if (!statement) return;
    setBankStatement(statement);
    setTransactions(loadTransactions(statementId));
    const session = loadUploadSession(statementId);
    if (session) {
      setUploadSession(session);
      setSelectedTransactions(session.selectedTransactionIds || []);
    }
    setFilters(loadFilters(statementId));
  }, [statementId]);

  useEffect(() => {
    if (bankStatement) saveBankStatement(bankStatement);
  }, [bankStatement]);

  useEffect(() => {
    if (transactions.length > 0 && bankStatement) {
      saveTransactions(bankStatement.id, transactions);
    }
  }, [transactions, bankStatement]);

  useEffect(() => {
    if (uploadSession) saveUploadSession(uploadSession);
  }, [uploadSession]);

  useEffect(() => {
    if (bankStatement) saveFilters(bankStatement.id, filters);
  }, [filters, bankStatement]);

  const persistSelection = useCallback(
    (ids) => {
      if (!bankStatement) return;
      setUploadSession({
        id: `session_${Date.now()}`,
        bankStatementId: bankStatement.id,
        selectedTransactionIds: ids,
        filters,
      });
    },
    [bankStatement, filters],
  );

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

  const setStatementTransactions = useCallback((newTransactions) => {
    setTransactions(newTransactions);
    setBankStatement((prev) =>
      prev
        ? {
            ...prev,
            totalTransactions: newTransactions.length,
            processingStatus: "completed",
          }
        : prev,
    );
  }, []);

  const toggleTransactionSelection = useCallback(
    (transactionId) => {
      setSelectedTransactions((prev) => {
        const next = prev.includes(transactionId)
          ? prev.filter((id) => id !== transactionId)
          : [...prev, transactionId];
        persistSelection(next);
        return next;
      });
    },
    [persistSelection],
  );

  const selectAllTransactions = useCallback(() => {
    const allIds = transactions.map((txn) => txn.id);
    setSelectedTransactions(allIds);
    persistSelection(allIds);
  }, [transactions, persistSelection]);

  const clearSelection = useCallback(() => {
    setSelectedTransactions([]);
    persistSelection([]);
  }, [persistSelection]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
  }, []);

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((txn) => {
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
        if (
          filters.searchText &&
          !txn.narration.toLowerCase().includes(filters.searchText.toLowerCase())
        ) {
          return false;
        }
        if (filters.transactionType === "debit" && txn.debitAmount <= 0) {
          return false;
        }
        if (filters.transactionType === "credit" && txn.creditAmount <= 0) {
          return false;
        }
        const amount =
          txn.debitAmount > 0 ? txn.debitAmount : txn.creditAmount;
        if (filters.amountRange.min && amount < filters.amountRange.min) {
          return false;
        }
        if (filters.amountRange.max && amount > filters.amountRange.max) {
          return false;
        }
        return true;
      }),
    [transactions, filters],
  );

  const summaryData = useMemo(() => {
    const totalIncome = filteredTransactions.reduce(
      (sum, txn) => sum + txn.creditAmount,
      0,
    );
    const totalExpenses = filteredTransactions.reduce(
      (sum, txn) => sum + txn.debitAmount,
      0,
    );
    return {
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      totalTransactions: filteredTransactions.length,
      selectedCount: selectedTransactions.length,
    };
  }, [filteredTransactions, selectedTransactions]);

  const setErrorState = useCallback((errorMessage) => {
    setError(errorMessage);
    setLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetStatement = useCallback(() => {
    if (bankStatement) clearStatementData(bankStatement.id);
    setBankStatement(null);
    setTransactions([]);
    setSelectedTransactions([]);
    setUploadSession(null);
    setFilters(EMPTY_FILTERS);
  }, [bankStatement]);

  const importTransactions = useCallback(
    async (mappedExpenses, mappingsToSave, onComplete) => {
      setImportStatus({
        inProgress: true,
        success: 0,
        duplicates: 0,
        total: mappedExpenses.length,
        errors: [],
      });

      try {
        const responses = await Promise.all(
          mappingsToSave.map((mapping) => API.saveBankMapping(mapping)),
        );
        const savedMappings = responses.map((response) => response.data.data);
        setMappings((current) => [
          ...savedMappings,
          ...current.filter(
            (mapping) =>
              !savedMappings.some(
                (saved) =>
                  saved.matchText === mapping.matchText &&
                  saved.direction === mapping.direction,
              ),
          ),
        ]);
      } catch (err) {
        setImportStatus((prev) => ({
          ...prev,
          inProgress: false,
          errors: [{ name: "Mappings", error: "Could not save bank mappings" }],
        }));
        return;
      }

      let successCount = 0;
      let duplicateCount = 0;
      const errors = [];

      for (const expense of mappedExpenses) {
        try {
          const { tempId, ...expenseData } = expense;
          await API.addExpense({
            ...expenseData,
            workspaceId: activeWorkspaceId,
          });
          successCount++;
          setImportStatus({
            inProgress: true,
            success: successCount,
            duplicates: duplicateCount,
            total: mappedExpenses.length,
            errors: [],
          });
        } catch (err) {
          if (err.response?.status === 409) {
            duplicateCount++;
            setImportStatus({
              inProgress: true,
              success: successCount,
              duplicates: duplicateCount,
              total: mappedExpenses.length,
              errors: [],
            });
            continue;
          }
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
          duplicates: duplicateCount,
          total: mappedExpenses.length,
          errors,
        });
      }
    },
    [activeWorkspaceId],
  );

  return {
    bankStatement,
    transactions,
    filters,
    selectedTransactions,
    loading,
    mappings,
    mappingsLoading,
    error,
    importStatus,
    filteredTransactions,
    summaryData,
    createNewStatement,
    setStatementTransactions,
    toggleTransactionSelection,
    selectAllTransactions,
    clearSelection,
    updateFilters,
    clearFilters,
    setLoadingState: setLoading,
    setErrorState,
    clearError,
    resetStatement,
    importTransactions,
  };
};
