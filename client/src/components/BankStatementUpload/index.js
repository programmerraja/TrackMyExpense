import React, { useCallback, useRef } from 'react';
import { parseBankStatementFile, validateFile } from '../../utils/fileParser';
import './style.css';

const BankStatementUpload = ({ 
  onFileUpload, 
  onFileProcessed, 
  onError, 
  loading = false,
  disabled = false 
}) => {
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const handleFileSelect = useCallback(async (file) => {
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      onError(validation.error);
      return;
    }

    try {
      onFileUpload(file);
      
      // Parse the file
      const transactions = await parseBankStatementFile(file);
      
      // Create bank statement object
      const bankStatement = {
        id: `stmt_${Date.now()}`,
        filename: file.name,
        fileSize: file.size,
        fileType: file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'txt',
        uploadDate: new Date(),
        processingStatus: 'completed',
        errorMessage: null,
        totalTransactions: transactions.length
      };

      onFileProcessed(bankStatement, transactions);
    } catch (error) {
      onError(`Failed to process file: ${error.message}`);
    }
  }, [onFileUpload, onFileProcessed, onError]);

  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled || loading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect, disabled, loading]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled && !loading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled, loading]);

  return (
    <div className="bank-statement-upload">
      <div
        ref={dropZoneRef}
        className={`upload-dropzone ${loading ? 'loading' : ''} ${disabled ? 'disabled' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          disabled={disabled || loading}
        />
        
        <div className="upload-content">
          {loading ? (
            <div className="upload-loading">
              <div className="spinner"></div>
              <p>Processing file...</p>
            </div>
          ) : (
            <div className="upload-prompt">
              <div className="upload-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7,10 12,15 17,10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </div>
              <h3>Upload Bank Statement</h3>
              <p>Drag and drop your CSV or TXT file here, or click to browse</p>
              <div className="upload-requirements">
                <p>Supported formats: CSV, TXT</p>
                <p>Maximum file size: 10MB</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankStatementUpload;
