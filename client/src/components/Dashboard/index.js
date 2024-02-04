import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router";

import SquareLoader from "../../components/SquareLoader";
// import "dayjs";

import errorHandler from "../../utils/errorHandler";
import API from "../../utils/API";

import "./style.css";
import Table from "../Table";
import { AddButton } from "../AddBtn";

const IMG_WRAPPER = {
  investment: () => (
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
      class="lucide lucide-piggy-bank absolute right-3 top-1 h-4 w-4"
    >
      <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"></path>
      <path d="M2 9v1c0 1.1.9 2 2 2h1"></path>
      <path d="M16 11h0"></path>
    </svg>
  ),
  income: () => (
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
      class="lucide lucide-banknote absolute right-3 top-1 h-4 w-4"
      data-state="closed"
    >
      <rect width="20" height="12" x="2" y="6" rx="2"></rect>
      <circle cx="12" cy="12" r="2"></circle>
      <path d="M6 12h.01M18 12h.01"></path>
    </svg>
  ),
  balance: () => (
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
      class="lucide lucide-wallet2 absolute right-3 top-1 h-4 w-4"
    >
      <path d="M17 14h.01"></path>
      <path d="M7 7h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14"></path>
    </svg>
  ),
};

export const EXPENSE_TYPE = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
  DEBT_BOUGHT: "DEBT_BOUGHT",
  DEBT: "DEBT",
  DEBT_GIVEN: "DEBT_GIVEN",
  INVESTMENT: "INVESTMENT",
  DASHBOARD: "DASHBOARD",
};
export const URL_MAPPER = {
  INCOME: "income",
  EXPENSE: "expense",
  DEBT_BOUGHT: "debt",
  DEBT: "debt",
  DEBT_GIVEN: "debt",
  INVESTMENT: "investment",
  DASHBOARD: "#",
};

let IS_FETCH_ALL_DATA = false;


function Dashboard({ type }) {
  // const date = useRef({
  //   start: new Date().toISOString(),
  //   end: new Date().toISOString(),
  //    // start: dayjs().startOf("M").toISOString(),
  //   // end: dayjs().endOf("D").toISOString(),
  // });

  const [apiCall, setAPICall] = useState(false);

  const [showForm, setShowFrom] = useState(false);

  const queryParams = new URLSearchParams(window.location.search)

  const [date, setDate] = useState({
    start: queryParams.get('start') ? new Date(queryParams.get('start')).toISOString() :  new Date(new Date().setDate(1)).toISOString(),
    end: queryParams.get('end') ? new Date(queryParams.get('end')).toISOString() :  new Date(new Date().setMinutes(360)).toISOString(),
  });

  const editDataRef = useRef(undefined);

  const { name } = useParams();

  const { loading, dashboardData, tableData } = useFeatchData(
    type,
    apiCall,
    date,
    name
  );

  const nameSuggestions =
    tableData &&
    tableData.data &&
    Array.from(new Set(tableData.data.map((obj) => obj.name)));

  function onEdit(state) {
    editDataRef.current = state;
    setShowFrom(true);
  }

  function onDelete(id) {
    API.deleteExpense(id).then((res) => {
      errorHandler(false, "done");
      setAPICall((e) => !e);
    });
  }

  function handleApply() {}
  return (
    <>
      <SquareLoader loading={loading} msg={".............."} />
      <AddButton
        show={showForm}
        editData={editDataRef.current}
        setAPICall={setAPICall}
        nameSuggestions={nameSuggestions}
      />
      <div className="dashboard">
        <h3>{type}</h3>
        <div className="dashboardHeader">
          <input
            type="date"
            onChange={(e) => setDate({ ...date, start:new Date(e.target.value).toISOString() })}
            value={date["start"].substring(0, 10)}
          ></input>
          <input
            type="date"
            value={date["end"].substring(0, 10)}
            onChange={(e) => setDate({ ...date, end: new Date(e.target.value).toISOString() })}
          ></input>
          <button
            onClick={() => {
              IS_FETCH_ALL_DATA = false;
              setAPICall((e) => !e);
            }}
          >
            Apply
          </button>
          <button
            onClick={() => {
              IS_FETCH_ALL_DATA = true;
              setAPICall((e) => !e);
            }}
          >
            all
          </button>
        </div>
        {type === EXPENSE_TYPE.DEBT && <p>postive mean i need to give</p>}
        <div className="priceCardContainer">
          {dashboardData &&
            Object.keys(dashboardData).map((key) => (
              <PriceCard
                title={key}
                amount={dashboardData[key]}
                showLink={
                  type === EXPENSE_TYPE.DASHBOARD || type === EXPENSE_TYPE.DEBT
                }
                date= {date}
              />
            ))}
        </div>
        {tableData && tableData.data && tableData.data.length ? (
          <Table
            heading={tableData.heading}
            data={tableData.data}
            onEdit={onEdit}
            onDelete={onDelete}
          ></Table>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}

function PriceCard({ title, amount, showLink,date }) {
  return (
    <a href={`${showLink ? (URL_MAPPER[title] || "/debt/" + title) + `?start=${date.start}&end=${date.end}` : ""}`}>
      <div className="priceCard">
        <div className="d-flex">
          <h5 className="priceCardTitle">{title}</h5>
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
            class="lucide lucide-briefcase absolute right-3 top-1 h-4 w-4"
          >
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        </div>
        <h1 className="priceCardAmount">₹ {API.numberWithCommas(amount)}</h1>
      </div>
    </a>
  );
}

export default Dashboard;

function useFeatchData(type, apiCall, date, name) {
  const [dashboardData, setDashboardData] = useState([]);
  const [tableData, setTableData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let params = "";
    if (date && date.start) {
      params += `start=${date.start}&end=${date.end}`;
    }
    if (IS_FETCH_ALL_DATA) {
      params += `&all=${IS_FETCH_ALL_DATA}`;
    }
    if (name) {
      params += `&name=${name}`;
    }
    API.getExpense(type, params).then((res) => {
      console.log(res.data.data);
      let temp = {};
      if (type === EXPENSE_TYPE.DASHBOARD) {
        temp = {
          INCOME: 0,
          BALANCE: 0,
          EXPENSE: 0,
        };
        res.data.data.group.map((obj) => {
          temp.BALANCE += obj.amount;
          temp[obj._id] = obj.amount;
        });
      } else {
        res.data.data.group.map((obj) => {
          temp[obj._id] = obj.amount;
        });
      }

      //   let heading = Object.keys(res.data.data.content[0]);
      let heading = ["name", "amount", "note", "category", "type", "eventDate"];

      setTableData({ heading, data: res.data.data.content });

      setDashboardData(temp);
      setLoading(false);
    });
  }, [apiCall]);

  return { loading, dashboardData, tableData };
}
