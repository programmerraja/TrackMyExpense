import React, { useState, useCallback, useMemo } from 'react';
import { Form } from '../AddBtn';
import './style.css';

const TransactionTable = ({ 
  transactions = [], 
  onTransactionUpdate, 
  onTransactionSelect,
  selectedTransactions = [],
  loading = false 
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const dateA = new Date(a.transactionDate);
      const dateB = new Date(b.transactionDate);
      return dateB - dateA; // Most recent first
    });
  }, [transactions]);

  const handleEditStart = useCallback((transaction) => {
    setEditingId(transaction.id);
    setEditValue(transaction.narration);
  }, []);

  const handleEditSave = useCallback(() => {
    if (editingId && editValue.trim()) {
      onTransactionUpdate(editingId, { narration: editValue.trim() });
      setEditingId(null);
      setEditValue('');
    }
  }, [editingId, editValue, onTransactionUpdate]);

  const handleEditCancel = useCallback(() => {
    setEditingId(null);
    setEditValue('');
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  }, [handleEditSave, handleEditCancel]);

  const handleSelectTransaction = useCallback((transactionId) => {
    onTransactionSelect(transactionId);
  }, [onTransactionSelect]);

  const handleSelectAll = useCallback(() => {
    const allIds = sortedTransactions.map(txn => txn.id);
    const allSelected = allIds.every(id => selectedTransactions.includes(id));
    
    if (allSelected) {
      // Deselect all visible transactions
      const newSelection = selectedTransactions.filter(id => !allIds.includes(id));
      allIds.forEach(id => onTransactionSelect(id));
    } else {
      // Select all visible transactions
      allIds.forEach(id => {
        if (!selectedTransactions.includes(id)) {
          onTransactionSelect(id);
        }
      });
    }
  }, [sortedTransactions, selectedTransactions, onTransactionSelect]);

  const handleAddToExpense = useCallback((transaction) => {
    setSelectedTransaction(transaction);
    setShowAddForm(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setShowAddForm(false);
    setSelectedTransaction(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setShowAddForm(false);
    setSelectedTransaction(null);
    // Optionally show success message or update UI
  }, []);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTransactionType = (transaction) => {
    if (transaction.debitAmount > 0) return 'Debit';
    if (transaction.creditAmount > 0) return 'Credit';
    return 'N/A';
  };

  const getTransactionAmount = (transaction) => {
    return transaction.debitAmount > 0 ? transaction.debitAmount : transaction.creditAmount;
  };

  if (loading) {
    return (
      <div className="transaction-table-loading">
        <div className="spinner"></div>
        <p>Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="transaction-table-empty">
        <p>No transactions found. Upload a bank statement to get started.</p>
      </div>
    );
  }

  return (
    <div className="transaction-table">
      <div className="table-header">
        <h3>Transactions ({transactions.length})</h3>
        <div className="table-actions">
          <button 
            className="btn-select-all"
            onClick={handleSelectAll}
          >
            {sortedTransactions.every(txn => selectedTransactions.includes(txn.id)) 
              ? 'Deselect All' 
              : 'Select All'
            }
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th className="col-select">
                <input
                  type="checkbox"
                  checked={sortedTransactions.length > 0 && sortedTransactions.every(txn => selectedTransactions.includes(txn.id))}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="col-date">Date</th>
              <th className="col-narration">Narration</th>
              <th className="col-type">Type</th>
              <th className="col-amount">Amount</th>
              <th className="col-balance">Balance</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((transaction) => (
              <tr key={transaction.id} className={selectedTransactions.includes(transaction.id) ? 'selected' : ''}>
                <td className="col-select">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.includes(transaction.id)}
                    onChange={() => handleSelectTransaction(transaction.id)}
                  />
                </td>
                <td className="col-date">{formatDate(transaction.transactionDate)}</td>
                <td className="col-narration">
                  {editingId === transaction.id ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleEditSave}
                      onKeyDown={handleKeyPress}
                      className="narration-edit"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="narration-text"
                      onClick={() => handleEditStart(transaction)}
                      title="Click to edit"
                    >
                      {transaction.narration}
                    </span>
                  )}
                </td>
                <td className="col-type">{getTransactionType(transaction)}</td>
                <td className={`col-amount ${transaction.debitAmount > 0 ? 'debit' : 'credit'}`}>
                  {formatAmount(getTransactionAmount(transaction))}
                </td>
                <td className="col-balance">{formatAmount(transaction.closingBalance)}</td>
                <td className="col-actions">
                  <button 
                    className="btn-add-expense"
                    onClick={() => handleAddToExpense(transaction)}
                    title="Add to Expense Tracking"
                  >
                    Add
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddForm && selectedTransaction && (
        <Form
          setShow={setShowAddForm}
          propsState={{
            name: selectedTransaction.narration,
            amount: Math.abs(getTransactionAmount(selectedTransaction)),
            eventDate: formatDate(selectedTransaction.transactionDate),
            type: selectedTransaction.debitAmount > 0 ? 'expense' : 'income',
            category: 'food', // Default category, user can change
            note: `From bank statement: ${selectedTransaction.narration}`,
            isEdit: false
          }}
          setAPICall={() => {}} // Not needed for this use case
          nameSuggestions={[]} // Could be populated from existing expenses
          onAddSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default TransactionTable;
