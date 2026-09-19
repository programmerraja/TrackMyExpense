import React, { useCallback, useState } from "react";

import BankStatementUpload from "../components/BankStatementUpload";
import ImportForm from "../components/ImportForm";
import { useToast } from "../components/Toast";
import { useBankStatement } from "../hooks/useBankStatement";

export default function BankStatement() {
  const [statementId, setStatementId] = useState(null);
  const {
    bankStatement,
    transactions,
    mappings,
    mappingsLoading,
    loading,
    error,
    createNewStatement,
    setStatementTransactions,
    setLoadingState,
    setErrorState,
    clearError,
    resetStatement,
    importTransactions,
    importStatus,
  } = useBankStatement(statementId);
  const { addToast } = useToast();

  const reset = useCallback(() => {
    resetStatement();
    setStatementId(null);
    clearError();
  }, [clearError, resetStatement]);

  const handleFileUpload = useCallback(
    (file) => {
      clearError();
      const statement = createNewStatement(file);
      setStatementId(statement.id);
      setLoadingState(true);
    },
    [clearError, createNewStatement, setLoadingState],
  );

  const handleFileProcessed = useCallback(
    (parsedTransactions) => {
      setStatementTransactions(parsedTransactions);
      setLoadingState(false);
    },
    [setStatementTransactions, setLoadingState],
  );

  const handleImport = (entries, mappingsToSave) => {
    importTransactions(entries, mappingsToSave, (result) => {
      if (result.errors.length) {
        addToast(
          `Imported ${result.success}; ${result.errors.length} failed`,
          "error",
        );
        return;
      }

      const duplicateMessage = result.duplicates
        ? `; ${result.duplicates} already imported`
        : "";
      addToast(
        `Imported ${result.success} entries${duplicateMessage}`,
        "success",
      );
      reset();
    });
  };

  if (bankStatement && !loading && transactions.length) {
    return (
      <main className="page-wide">
        <ImportForm
          transactions={transactions}
          mappings={mappings}
          mappingsLoading={mappingsLoading}
          importStatus={importStatus}
          onCancel={reset}
          onImport={handleImport}
        />
      </main>
    );
  }

  return (
    <main className="page-wide">
      <header className="mb-5">
        <h1 className="page-title">Import statement</h1>
        <p className="page-subtitle">
          Upload once, review known groups, and teach new transactions
        </p>
      </header>

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-money-out/20 bg-money-out/10 px-4 py-3 text-sm text-money-out">
          <span>{error}</span>
          <button onClick={clearError} className="font-semibold">
            Dismiss
          </button>
        </div>
      )}

      <BankStatementUpload
        onFileUpload={handleFileUpload}
        onFileProcessed={handleFileProcessed}
        onError={setErrorState}
        loading={loading}
      />
    </main>
  );
}
