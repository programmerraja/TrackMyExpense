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
    isRecurring: false,
    recurringFrequency: "monthly",
  });
  const [errors, setErrors] = useState({});

  const TYPE_DISPLAY = {
    INCOME: "Income",
    EXPENSE: "Expense",
    DEBT_BOUGHT: "Debt (Bought)",
    DEBT_GIVEN: "Debt (Given)",
    INVESTMENT: "Investment",
    INCOME_TAX: "Income Tax",
  };

  // Types that can be selected when adding new entries
  const SELECTABLE_TYPES = [
    EXPENSE_TYPE.INCOME,
    EXPENSE_TYPE.EXPENSE,
    EXPENSE_TYPE.DEBT_BOUGHT,
    EXPENSE_TYPE.DEBT_GIVEN,
    EXPENSE_TYPE.INVESTMENT,
    EXPENSE_TYPE.INCOME_TAX,
  ];

  // Whether the type is locked (opened from a specific page, not dashboard)
  const isTypeLocked =
    propsState.type &&
    propsState.type !== EXPENSE_TYPE.DASHBOARD &&
    !propsState.isEdit;

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
    // Clear error for this field on change
    if (errors[element.id]) {
      setErrors((prev) => ({ ...prev, [element.id]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!state.name || !state.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!state.amount || Number(state.amount) === 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (!state.eventDate) {
      newErrors.eventDate = "Date is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = () => {
    if (!validate()) {
      addToast("Please fix the errors before submitting", "error");
      return;
    }

    const payload = Object.fromEntries(
      Object.entries(state).map(([key, value]) => [
        key,
        inputConverter(state.type, value, key),
      ]),
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
          "error",
        );
        if (propsState.isEdit && onEditFailure) {
          onEditFailure(err);
        }
      });
  };

  return (
    <div className="pfixed" onClick={() => setShow((e) => !e)}>
      <div className="fromContainer" onClick={(e) => e.stopPropagation()}>
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

        <h3 className="formTitle">
          {propsState?.isEdit ? "Edit Entry" : "New Entry"}
        </h3>

        <form>
          <label className="block">
            <span className="block">Type</span>
            <select
              id="type"
              required
              value={state.type}
              onChange={(e) => handleChange(e.target)}
              disabled={isTypeLocked}
              style={
                isTypeLocked ? { opacity: 0.6, cursor: "not-allowed" } : {}
              }
            >
              {SELECTABLE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {TYPE_DISPLAY[type] || type}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block">Name</span>
            <input
              type="text"
              id="name"
              placeholder="e.g. Grocery, Rent, Salary..."
              value={state.name}
              onChange={(e) => handleChange(e.target)}
              list="options"
              className={errors.name ? "fieldError" : ""}
            />
            {errors.name && <span className="errorText">{errors.name}</span>}
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
                placeholder="0"
                value={Math.abs(state.amount) || ""}
                onChange={(e) => handleChange(e.target)}
                min="0"
                className={errors.amount ? "fieldError" : ""}
              />
              {errors.amount && (
                <span className="errorText">{errors.amount}</span>
              )}
            </label>

            <label className="block">
              <span className="block">Date</span>
              <input
                type="date"
                id="eventDate"
                value={state.eventDate}
                onChange={(e) => handleChange(e.target)}
                className={errors.eventDate ? "fieldError" : ""}
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

          <div className="recurringToggle">
            <label className="toggleLabel">
              <input
                type="checkbox"
                checked={state.isRecurring}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    isRecurring: e.target.checked,
                  }))
                }
              />
              <span className="toggleSwitch"></span>
              <span>Recurring</span>
            </label>
            {state.isRecurring && (
              <select
                id="recurringFrequency"
                value={state.recurringFrequency}
                onChange={(e) => handleChange(e.target)}
                className="frequencySelect"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            )}
          </div>

          <label className="block">
            <span className="block">Notes (optional)</span>
            <textarea
              id="note"
              placeholder="Add details..."
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
    <select id="category" required="" value={value} onChange={onChange}>
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
