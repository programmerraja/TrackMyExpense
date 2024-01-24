import React, { useEffect, useState } from "react";
import "./style.css";
import API from "../../utils/API";
import { EXPENSE_TYPE } from "../Dashboard";
import errorHandler from "../../utils/errorHandler";

export function From({ setShow, propsState, setAPICall, nameSuggestions }) {
  const [state, setState] = useState({
    type: EXPENSE_TYPE.INCOME,
    name: "",
    amount: 0,
    eventDate: new Date().toISOString().substring(0, 10),
    category: "Food",
    note: "",
  });

  useEffect(() => {
    if (propsState) {
      setState(propsState);
    }
  }, [propsState]);

  function inputConverter(type, value, id) {
    console.log(type, value, id);
    // excpect income and
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
  }

  function handleChange(element) {
    setState({
      ...state,
      [element.id]: element.value,
    });
  }

  function onSubmit() {
    let payload = {};

    Object.keys(state).map((key) => {
      payload[key] = inputConverter(state.type, state[key], key);
    });

    API.addExpense(payload)
      .then(() => {
        errorHandler(false, "Done");
        setShow((e) => !e);
        setAPICall((e) => !e);
      })
      .catch((err) => errorHandler(true, "Server Error"));
  }

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
            value={state["type"]}
            onChange={(e) => {
              handleChange(e.target);
            }}
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
            value={state["name"]}
            placeholder="name"
            id="name"
            onChange={(e) => {
              handleChange(e.target);
            }}
            list="options"
          ></input>
          <datalist id="options">
            {nameSuggestions && nameSuggestions.map((name) => (
              <option>{name}</option>
            ))}
          </datalist>
        </label>

        <div className="d-flex twoFrom">
          <label className="block d-flex-direction">
            <span className="block text-sm font-medium text-zinc-800">
              Amount
            </span>
            <input
              type="number"
              value={Math.abs(state["amount"])}
              id="amount"
              placeholder="amount"
              onChange={(e) => {
                handleChange(e.target);
              }}
            ></input>
          </label>

          <label className="block d-flex-direction">
            <span className="block text-sm font-medium text-zinc-800">
              Date
            </span>
            <input
              type="date"
              id="eventDate"
              value={state["eventDate"]}
              onChange={(e) => {
                handleChange(e.target);
              }}
            ></input>
          </label>
        </div>

        <label className="block d-flex-direction">
          <span className="block text-sm font-medium text-zinc-800">
            Category
          </span>
          <Category
            value={state["category"]}
            onChange={(e) => {
              handleChange(e.target);
            }}
          ></Category>
        </label>

        <label className="block d-flex-direction">
          <span className="block text-sm font-medium text-zinc-800">Notes</span>
          <textarea
            id="note"
            value={state["note"]}
            onChange={(e) => {
              handleChange(e.target);
            }}
          />
        </label>
        <div>
          <button className="formBtn" onClick={onSubmit}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function Category({ onChange, value }) {
  return (
    <select id="category" required="" onChange={onChange} value={value}>
      <optgroup label="Expenses">
        <option value="bills">Bills</option>
        {/* <option value="education">Education</option> */}
        <option value="order">Online Order</option>
        <option value="rent">Rent</option>
        <option value="home">home</option>
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
        {/* <option value="emi">EMI</option> */}
        {/* <option value="savings">Savings</option> */}
        <option value="debt">Debt</option>
        {/* <option value="loan">Loan</option> */}
      </optgroup>
      <optgroup label="income">
        <option value="emi">salary</option>
        <option value="savings">stock</option>
      </optgroup>
      <optgroup label="investment">
        <option value="stock">stock</option>
        <option value="post office">post office</option>
      </optgroup>
      <option value="other">Others</option>
    </select>
  );
}

export function AddButton(props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(props.show);
  }, [props.show]);

  return (
    <div>
      <div className="addBtn">
        <button
          onClick={() => {
            setShow((p) => !p);
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
        {show && (
          <From
            setShow={setShow}
            propsState={props.editData}
            setAPICall={props.setAPICall}
            nameSuggestions={props.nameSuggestions}
          />
        )}
      </div>
    </div>
  );
}
