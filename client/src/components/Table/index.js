import React from "react";
import "./style.css";

export default function Table({ heading, data, onEdit, onDelete }) {
  const handleDelete = (id, amount, note) => {
    if (window.confirm(`Are you sure you want to delete this item? Amount: ${amount}, Note: ${note}`)) {
      onDelete(id);
    }
  };

  return (
    <div className="tableContainer">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {heading.map((val, index) => (
                <th key={index}>{val}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((tableContent, index) => (
              <tr key={index}>
                {heading.map((val, index) => (
                  <td key={index}>
                    {val === "eventDate"
                      ? new Date(tableContent[val]).toLocaleDateString()
                      : tableContent[val]}
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
                    onClick={() => handleDelete(tableContent._id, tableContent.amount, tableContent.note)}
                    title="Delete"
                    style={{ marginLeft: '12px' }}
                  ></i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card-wrapper">
        {data.map((tableContent, index) => (
          <div key={index} className="card">
            {heading.map((val, index) => (
              <div key={index} className="card-row">
                <span className="card-heading">{val}:</span>
                <span className="card-content">
                  {val === "eventDate"
                    ? new Date(tableContent[val]).toLocaleDateString()
                    : tableContent[val]}
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
                onClick={() => handleDelete(tableContent._id, tableContent.amount, tableContent.note)}
                title="Delete"
              ></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
