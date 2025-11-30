import React, { useEffect, useRef, useState } from "react";
import "./style.css";
import API from "../../utils/API";
import { EXPENSE_TYPE } from "../Dashboard";
import { useToast } from "../Toast";

export function Form({
  setShow,
  propsState,
  setAPICall,
  nameSuggestions,
  onEditSuccess,
  onEditFailure,
  onAddSuccess,
}) {
  const { addToast } = useToast();
  const [state, setState] = useState({
    type: EXPENSE_TYPE.INCOME,
    name: "",
    amount: 0,
    eventDate: new Date().toISOString().substring(0, 10),
    category: "food",
    note: "",
  });

  useEffect(() => {
    if (Object.keys(propsState).length) {
      setState((prevState) => ({
        ...prevState,
        ...propsState,
        type:
          propsState.type === EXPENSE_TYPE.DEBT
            ? EXPENSE_TYPE.DEBT_BOUGHT
            : propsState.type,
        eventDate: propsState.eventDate
          ? new Date(propsState.eventDate).toISOString().substring(0, 10)
          : prevState.eventDate,
      }));
    }
  }, [propsState]);

  const inputConverter = (type, value, id) => {
    if (
      ![EXPENSE_TYPE.INCOME, EXPENSE_TYPE.DEBT_BOUGHT].includes(type) &&
      id === "amount"
    ) {
      return value * -1;
    }
    if (typeof value === "string" && id !== "type") {
      return value.toLowerCase();
    }
    return value;
  };

  const handleChange = (element) => {
    setState((prevState) => ({ ...prevState, [element.id]: element.value }));
  };

  const onSubmit = () => {
    const payload = Object.fromEntries(
      Object.entries(state).map(([key, value]) => [
        key,
        inputConverter(state.type, value, key),
      ])
    );

    API.addExpense(payload)
      .then((response) => {
        if (propsState.isEdit) {
          addToast("Item updated successfully", "success");
          if (onEditSuccess) {
            onEditSuccess(response.data);
          }
        } else {
          addToast("Item added successfully", "success");
          if (onAddSuccess) {
            onAddSuccess(response.data);
          }
        }
        setShow((e) => !e);
        setAPICall((e) => !e);
      })
      .catch((err) => {
        addToast(
          propsState.isEdit ? "Failed to update item" : "Failed to add item",
          "error"
        );
        if (propsState.isEdit && onEditFailure) {
          onEditFailure(err);
        }
      });
  };

  return (
    <div className="pfixed">
      <div className="fromContainer">
        <div className="fromCloseIcon">
          <svg
            onClick={() => setShow((e) => !e)}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </div>

        <form>
          <label className="block">
            <span className="block">Type</span>
            <select
              id="type"
              required
              value={state.type}
              onChange={(e) => handleChange(e.target)}
            >
              {Object.values(EXPENSE_TYPE).map((type) => (
                <option key={type} value={type}>
                  {type.toLowerCase()}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block">Name</span>
            <input
              type="text"
              id="name"
              value={state.name}
              onChange={(e) => handleChange(e.target)}
              list="options"
            />
            <datalist id="options">
              {nameSuggestions &&
                nameSuggestions.map((name) => (
                  <option key={name}>{name}</option>
                ))}
            </datalist>
          </label>

          <div className="twoFrom">
            <label className="block">
              <span className="block">Amount</span>
              <input
                type="number"
                id="amount"
                value={Math.abs(state.amount)}
                onChange={(e) => handleChange(e.target)}
              />
            </label>

            <label className="block">
              <span className="block">Date</span>
              <input
                type="date"
                id="eventDate"
                value={state.eventDate}
                onChange={(e) => handleChange(e.target)}
              />
            </label>
          </div>

          <label className="block">
            <span className="block">Category</span>
            <Category
              id="category"
              value={state.category}
              onChange={(e) => handleChange(e.target)}
            />
          </label>

          <label className="block">
            <span className="block">Notes</span>
            <textarea
              id="note"
              value={state.note}
              onChange={(e) => handleChange(e.target)}
            />
          </label>

          <button type="button" onClick={onSubmit} className="formBtn">
            {propsState?.isEdit ? "Update" : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Category({ onChange, value }) {
  return (
    <select id="category" required="" onChange={onChange}>
      <optgroup label="Expenses">
        <option value="bills" selected={value === "bills"}>
          Bills
        </option>
        <option value="order" selected={value === "order"}>
          Online Order
        </option>
        <option value="rent" selected={value === "rent"}>
          Rent
        </option>
        <option value="home" selected={value === "home"}>
          home
        </option>
        <option value="food" selected={value === "food"}>
          Food
        </option>
        <option value="medical" selected={value === "medical"}>
          Medical
        </option>
      </optgroup>
      <optgroup label="Leisure">
        <option value="entertainment" selected={value === "entertainment"}>
          Entertainment
        </option>
        <option value="shopping" selected={value === "shopping"}>
          Shopping
        </option>
        <option value="travel" selected={value === "travel"}>
          Travel
        </option>
        <option value="sports" selected={value === "sports"}>
          Sports
        </option>
      </optgroup>
      <optgroup label="Payments">
        <option value="debt" selected={value === "debt"}>
          Debt
        </option>
      </optgroup>
      <optgroup label="income">
        <option value="salary" selected={value === "salary"}>
          salary
        </option>
        <option value="savings" selected={value === "savings"}>
          stock
        </option>
      </optgroup>
      <optgroup label="investment">
        <option value="stock" selected={value === "stock"}>
          stock
        </option>
        <option value="post office" selected={value === "post office"}>
          post office
        </option>
      </optgroup>
      <option value="other" selected={value === "other"}>
        Others
      </option>
       <option value="other" selected={value === "freinds"}>
        Freinds
      </option>
      <option value="other" selected={value === "other"}>
        Tax
      </option>
    </select>
  );
}

export function AddButton({
  show,
  setShowFrom,
  editData,
  type,
  setAPICall,
  nameSuggestions,
  onEditSuccess,
  onEditFailure,
  onAddSuccess,
}) {
  const isNew = useRef(false);

  useEffect(() => {
    isNew.current = false;
  }, [show]);

  const handleClick = () => {
    isNew.current = true;
    setShowFrom((prev) => !prev);
  };

  return (
    <>
      <div className="addBtn">
        <button onClick={handleClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14"></path>
          </svg>
        </button>
      </div>

      {show && (
        <Form
          setShow={() => setShowFrom((prev) => !prev)}
          propsState={
            !isNew.current && editData
              ? {
                  ...editData,
                  eventDate: editData.eventDate
                    ? new Date(editData.eventDate).toISOString()
                    : new Date().toISOString(),
                }
              : {
                  type: type !== "DASHBOARD" ? type : EXPENSE_TYPE.INCOME,
                  name: "",
                  amount: 0,
                  eventDate: new Date().toISOString(),
                  category: "food",
                  note: "",
                  isEdit: false,
                }
          }
          setAPICall={setAPICall}
          nameSuggestions={nameSuggestions}
          onEditSuccess={onEditSuccess}
          onEditFailure={onEditFailure}
          onAddSuccess={onAddSuccess}
        />
      )}
    </>
  );
}
