import React, { useCallback, useRef } from "react";

import {
  parseBankStatementFile,
  validateFile,
} from "../../utils/fileParser";

export default function BankStatementUpload({
  onFileUpload,
  onFileProcessed,
  onError,
  loading = false,
  disabled = false,
}) {
  const inputRef = useRef(null);

  const processFile = useCallback(
    async (file) => {
      if (!file) return;
      const validation = validateFile(file);
      if (!validation.isValid) {
        onError(validation.error);
        return;
      }

      try {
        onFileUpload(file);
        onFileProcessed(await parseBankStatementFile(file));
      } catch (error) {
        onError(`Could not read this statement: ${error.message}`);
      }
    },
    [onFileUpload, onFileProcessed, onError],
  );

  const openPicker = () => {
    if (!disabled && !loading) inputRef.current.click();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (!disabled && !loading) processFile(event.dataTransfer.files[0]);
  };

  return (
    <button
      type="button"
      onClick={openPicker}
      onDrop={handleDrop}
      onDragOver={(event) => event.preventDefault()}
      disabled={disabled || loading}
      className="card flex w-full flex-col items-center border-dashed p-8 text-center transition hover:border-brand-500/40 hover:bg-ink-800 disabled:cursor-wait sm:p-12"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.txt"
        onChange={(event) => processFile(event.target.files[0])}
        className="hidden"
        disabled={disabled || loading}
      />

      {loading ? (
        <>
          <span className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-brand-400" />
          <p className="mt-4 font-semibold">Reading statement…</p>
        </>
      ) : (
        <>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6"
            >
              <path d="M12 3v12m0-12L8 7m4-4 4 4" />
              <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
            </svg>
          </span>
          <p className="mt-4 font-semibold">Choose bank statement</p>
          <p className="mt-1 max-w-sm text-sm text-slate-400">
            CSV or TXT, up to 10 MB. You will review every row before importing.
          </p>
          <span className="btn-primary mt-5">Browse files</span>
        </>
      )}
    </button>
  );
}
