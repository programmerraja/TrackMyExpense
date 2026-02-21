import React, { useState, useEffect } from "react";
import "./style.css";

const EXPENSE_TYPES = [
  { value: "EXPENSE", label: "Expense" },
  { value: "INCOME", label: "Income" },
  { value: "INVESTMENT", label: "Investment" },
  { value: "DEBT", label: "Debt" },
  { value: "INCOME_TAX", label: "Income Tax" },
];

const CategorySelect = ({ value, onChange }) => (
  <select value={value} onChange={onChange} className="category-select">
    <optgroup label="Expenses">
      <option value="bills">Bills</option>
      <option value="order">Online Order</option>
      <option value="rent">Rent</option>
      <option value="home">Home</option>
      <option value="food">Food</option>
      <option value="medical">Medical</option>
    </optgroup>
    <optgroup label="Leisure">
      <option value="entertainment">Entertainment</option>
      <option value="shopping">Shopping</option>
      <option value="travel">Travel</option>
      <option value="sports">Sports</option>
    </optgroup>
    <optgroup label="Payments">
      <option value="debt">Debt</option>
      <option value="friends">Friends</option>
    </optgroup>
    <optgroup label="Income">
      <option value="salary">Salary</option>
      <option value="savings">Savings</option>
    </optgroup>
    <optgroup label="Investment">
      <option value="stock">Stock</option>
      <option value="post office">Post Office</option>
    </optgroup>
    <optgroup label="Tax">
      <option value="tax">Tax</option>
    </optgroup>
    <option value="other">Others</option>
  </select>
);

const ImportForm = ({ transactions, onImport, onCancel, importStatus }) => {
  const [mappedExpenses, setMappedExpenses] = useState([]);
  const [bulkCategory, setBulkCategory] = useState("other");

  useEffect(() => {
    // Initialize mapped expenses from transactions
    const initial = transactions.map((txn) => {
      const isCredit = txn.creditAmount > 0;
      return {
        tempId: txn.id,
        name: txn.narration,
        amount: isCredit ? txn.creditAmount : txn.debitAmount,
        type: isCredit ? "INCOME" : "EXPENSE",
        category: isCredit ? "salary" : "food",
        eventDate: txn.transactionDate,
        note: `Imported from bank statement: ${txn.referenceNumber || ""}`,
      };
    });
    setMappedExpenses(initial);
  }, [transactions]);

  const handleUpdateItem = (tempId, field, value) => {
    setMappedExpenses((prev) =>
      prev.map((item) =>
        item.tempId === tempId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleBulkApplyCategory = () => {
    setMappedExpenses((prev) =>
      prev.map((item) => ({ ...item, category: bulkCategory })),
    );
  };

  const handleSubmit = () => {
    onImport(mappedExpenses);
  };

  if (importStatus.inProgress) {
    const progress = (importStatus.success / importStatus.total) * 100;
    return (
      <div className="import-progress-container">
        <h2>Importing Transactions...</h2>
        <div className="progress-bar-wrapper">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <p>
          Importing {importStatus.success} of {importStatus.total}
        </p>
      </div>
    );
  }

  if (
    !importStatus.inProgress &&
    importStatus.total > 0 &&
    importStatus.errors.length > 0
  ) {
    return (
      <div className="import-results-container">
        <h2>Import Completed with Errors</h2>
        <p>Successfully imported: {importStatus.success}</p>
        <div className="error-list">
          {importStatus.errors.map((err, i) => (
            <div key={i} className="error-item">
              <strong>{err.name}:</strong> {err.error}
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={onCancel}>
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="import-form">
      <div className="import-header">
        <h2>Review & Import</h2>
        <p>
          Assign category and type for selected transactions before importing.
        </p>
      </div>

      <div className="bulk-actions">
        <div className="bulk-item">
          <span>Set all categories to:</span>
          <CategorySelect
            value={bulkCategory}
            onChange={(e) => setBulkCategory(e.target.value)}
          />
          <button className="btn-secondary" onClick={handleBulkApplyCategory}>
            Apply All
          </button>
        </div>
      </div>

      <div className="import-list">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {mappedExpenses.map((item) => (
              <tr key={item.tempId}>
                <td>{new Date(item.eventDate).toLocaleDateString()}</td>
                <td>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      handleUpdateItem(item.tempId, "name", e.target.value)
                    }
                  />
                </td>
                <td
                  className={
                    item.type === "INCOME" ? "text-income" : "text-expense"
                  }
                >
                  ₹{item.amount.toLocaleString()}
                </td>
                <td>
                  <select
                    value={item.type}
                    onChange={(e) =>
                      handleUpdateItem(item.tempId, "type", e.target.value)
                    }
                  >
                    {EXPENSE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <CategorySelect
                    value={item.category}
                    onChange={(e) =>
                      handleUpdateItem(item.tempId, "category", e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="import-footer">
        <button className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn-primary" onClick={handleSubmit}>
          Import {mappedExpenses.length} Items
        </button>
      </div>
    </div>
  );
};

export default ImportForm;
