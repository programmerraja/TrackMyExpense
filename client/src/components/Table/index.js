import React, { useState, useEffect, useRef } from "react";
import "./style.css";

export default function Table({ heading, data, onEdit, onDelete }) {
  return (
    <div className="tableContainer">
      <table>
        <tr>
          {heading.map((val) => (
            <td>{val}</td>
          ))}
          <td>Edit</td>
          <td>delete</td>
        </tr>
        {data.map((tableContent) => {
          return (
            <>
              <tr>
                {heading.map((val) => (
                  <td>
                    {val === "eventDate"
                      ? new Date(tableContent[val]).toDateString()
                      : tableContent[val]}
                  </td>
                ))}

                <td>
                  {" "}
                  <i
                    class="fas fa-edit"
                    onClick={() => {
                      onEdit(tableContent);
                    }}
                  ></i>{" "}
                </td>
                <td>
                  {" "}
                  <i
                    class="fa-solid fa-trash-can"
                    onClick={() => onDelete(tableContent._id)}
                  ></i>{" "}
                </td>
              </tr>
            </>
          );
        })}
      </table>
    </div>
  );
}
{
  /* <i class="fa-solid fa-trash-can" onClick={()=>onDeleteTransaction(transaction)}></i>  */
}

{
  /* <i class=\"fas fa-edit\" onClick={()=>{showEdit(transaction)}}></i>\n       */
}
