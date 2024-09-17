import React from "react";
import "./style.css";

export default function Table({ heading, data, onEdit, onDelete }) {
  return (
    <div className="tableContainer">
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
                  onClick={() => onDelete(tableContent._id)}
                  title="Delete"
                  style={{ marginLeft: '12px' }}
                ></i>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
