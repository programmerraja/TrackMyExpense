import React, { useEffect, useRef, useState } from "react";
import "./style.css";
import API from "../../utils/API";
import { EXPENSE_TYPE } from "../Dashboard";
import errorHandler from "../../utils/errorHandler";

export function Form({ setShow, propsState, setAPICall, nameSuggestions }) {
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
      setState(propsState);
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

  console.log(state, "log");
  const handleChange = (element) => {
    setState((prevState) => ({ ...prevState, [element.id]: element.value }));
  };

  const onSubmit = () => {
    const payload = {};
    console.log(state, "stat");
    Object.keys(state).forEach((key) => {
      payload[key] = inputConverter(state.type, state[key], key);
    });

    API.addExpense(payload)
      .then(() => {
        errorHandler(false, "Done");
        setShow((e) => !e);
        setAPICall((e) => !e);
      })
      .catch((err) => errorHandler(true, "Server Error"));
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
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-x h-5 w-5 text-primary"
          >
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </div>

        <label className="block d-flex-direction">
          <span className="block" id="type">
            Type
          </span>
          <select
            id="type"
            required=""
            value={state.type}
            onChange={(e) => handleChange(e.target)}
          >
            <option value={EXPENSE_TYPE.INCOME}>income</option>
            <option value={EXPENSE_TYPE.EXPENSE}>expense</option>
            <option value={EXPENSE_TYPE.INVESTMENT}>investment</option>
            <option value={EXPENSE_TYPE.DEBT_GIVEN}>dept given</option>
            <option value={EXPENSE_TYPE.DEBT_BOUGHT}>dept bought</option>
          </select>
        </label>

        <label className="block d-flex-direction">
          <span className="block text-sm font-medium text-zinc-800">Name</span>
          <input
            type="text"
            value={state.name}
            placeholder="name"
            id="name"
            onChange={(e) => handleChange(e.target)}
            list="options"
          ></input>
          <datalist id="options">
            {nameSuggestions &&
              nameSuggestions.map((name) => <option>{name}</option>)}
          </datalist>
        </label>

        <div className="d-flex twoFrom">
          <label className="block d-flex-direction">
            <span className="block text-sm font-medium text-zinc-800">
              Amount
            </span>
            <input
              type="number"
              value={Math.abs(state.amount)}
              id="amount"
              placeholder="amount"
              onChange={(e) => handleChange(e.target)}
            ></input>
          </label>

          <label className="block d-flex-direction">
            <span className="block text-sm font-medium text-zinc-800">
              Date
            </span>
            <input
              type="date"
              id="eventDate"
              value={state.eventDate}
              onChange={(e) => handleChange(e.target)}
            ></input>
          </label>
        </div>

        <label className="block d-flex-direction">
          <span className="block text-sm font-medium text-zinc-800">
            Category
          </span>
          <Category
            value={state.category}
            onChange={(e) => handleChange(e.target)}
          ></Category>
        </label>

        <label className="block d-flex-direction">
          <span className="block text-sm font-medium text-zinc-800">Notes</span>
          <textarea
            id="note"
            value={state.note}
            onChange={(e) => handleChange(e.target)}
          />
        </label>
        <div>
          <button className="formBtn" onClick={onSubmit}>
            {propsState?.isEdit ? "Update" : "Create"}
          </button>
        </div>
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
        {/* <option value="education" selected={value === "education"}>Education</option> */}
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
    </select>
  );
}
export function AddButton(props) {
  const isNew = useRef(false);

  useEffect(() => {
    isNew.current = false;
  }, [props.show]);

  return (
    <div>
      <div className="addBtn">
        <button
          onClick={() => {
            isNew.current = true;
            props.setShowFrom((p) => !p);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-plus h-12 w-12"
          >
            <path d="M5 12h14"></path>
            <path d="M12 5v14"></path>
          </svg>
        </button>
      </div>

      <div>
        {props.show && (
          <Form
            setShow={() => {
              props.setShowFrom((p) => !p);
            }}
            propsState={
              !isNew.current
                ? props.editData
                : {
                    type:
                      props.type !== "DASHBOARD"
                        ? props.type
                        : EXPENSE_TYPE.INCOME,
                    name: "",
                    amount: 0,
                    eventDate: new Date().toISOString().substring(0, 10),
                    category: "food",
                    note: "",
                  }
            }
            setAPICall={props.setAPICall}
            nameSuggestions={props.nameSuggestions}
          />
        )}
      </div>
    </div>
  );
}
