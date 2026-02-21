import React from "react";
import "./style.css";

const HEADING_LABELS = {
  name: "Name",
  amount: "Amount",
  note: "Note",
  category: "Category",
  type: "Type",
  eventDate: "Date",
};

function formatCellValue(key, value) {
  if (value == null || value === "") return "—";
  if (key === "eventDate") {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  if (key === "amount") {
    return `₹ ${Math.abs(value).toLocaleString("en-IN")}`;
  }
  if (key === "category" || key === "type") {
    return String(value).charAt(0).toUpperCase() + String(value).slice(1);
  }
  return value;
}

export default function Table({ heading, data, onEdit, onDelete }) {
  const handleDelete = (id, amount, note) => {
    if (
      window.confirm(
        `Are you sure you want to delete this item? Amount: ${amount}, Note: ${note}`,
      )
    ) {
      onDelete(id);
    }
  };

  return (
    <div className="tableContainer">
      {/* Desktop Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {heading.map((val, index) => (
                <th key={index}>{HEADING_LABELS[val] || val}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((tableContent, index) => (
              <tr key={tableContent._id || index}>
                {heading.map((val, idx) => (
                  <td key={idx}>
                    {formatCellValue(val, tableContent[val])}
                    {val === "name" && tableContent.isRecurring && (
                      <span
                        className="recurringBadge"
                        title={`Recurring ${tableContent.recurringFrequency || "monthly"}`}
                      >
                        🔄
                      </span>
                    )}
                  </td>
                ))}
                <td>
                  <i
                    className="fas fa-edit edit-icon"
                    onClick={() => onEdit(tableContent)}
                    title="Edit"
                  ></i>
                  <i
                    className="fa-solid fa-trash-can delete-icon"
                    onClick={() =>
                      handleDelete(
                        tableContent._id,
                        tableContent.amount,
                        tableContent.note,
                      )
                    }
                    title="Delete"
                    style={{ marginLeft: "12px" }}
                  ></i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="card-wrapper">
        {data.map((tableContent, index) => (
          <div key={tableContent._id || index} className="card">
            {heading.map((val, idx) => (
              <div key={idx} className="card-row">
                <span className="card-heading">
                  {HEADING_LABELS[val] || val}
                </span>
                <span className="card-content">
                  {formatCellValue(val, tableContent[val])}
                  {val === "name" && tableContent.isRecurring && (
                    <span
                      className="recurringBadge"
                      title={`Recurring ${tableContent.recurringFrequency || "monthly"}`}
                    >
                      🔄
                    </span>
                  )}
                </span>
              </div>
            ))}
            <div className="card-actions">
              <i
                className="fas fa-edit edit-icon"
                onClick={() => onEdit(tableContent)}
                title="Edit"
              ></i>
              <i
                className="fa-solid fa-trash-can delete-icon"
                onClick={() =>
                  handleDelete(
                    tableContent._id,
                    tableContent.amount,
                    tableContent.note,
                  )
                }
                title="Delete"
              ></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
