import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useLocation, Link } from "react-router-dom";
import { useToast } from "../Toast";

import {
  SquareLoader,
  Table,
  AddButton,
  FilterComponent
} from "..";
import API from "../../utils/API";
import "./style.css";

export const EXPENSE_TYPE = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
  DEBT_BOUGHT: "DEBT_BOUGHT",
  DEBT: "DEBT",
  DEBT_GIVEN: "DEBT_GIVEN",
  INVESTMENT: "INVESTMENT",
  DASHBOARD: "DASHBOARD",
  INCOME_TAX: "INCOME_TAX",
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
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [apiCall, setAPICall] = useState(false);
  const [showForm, setShowFrom] = useState(false);
  const [date, setDate] = useState({
    start: queryParams.get("start")
      ? new Date(queryParams.get("start")).toISOString()
      : new Date(new Date().setDate(0)).toISOString(),
    end: queryParams.get("end")
      ? new Date(queryParams.get("end")).toISOString()
      : new Date().toISOString(),
  });

  const editDataRef = useRef(undefined);

  const { loading, dashboardData, tableData, setDashboardData, setTableData } =
    useFeatchData(
      type,
      apiCall,
      date,
      queryParams.get("name"),
      queryParams.get("category"),
      IS_FETCH_ALL_DATA || queryParams.get("all")
    );

  const nameSuggestions = useMemo(
    () =>
      tableData && tableData.data
        ? Array.from(new Set(tableData.data.map((obj) => obj.name)))
        : [],
    [tableData]
  );

  const onEdit = useCallback((state) => {
    editDataRef.current = { ...state, isEdit: true };
    setShowFrom(true);
  }, []);

  const { addToast } = useToast();

  const onDelete = useCallback(
    (id) => {
      API.deleteExpense(id)
        .then(() => {
          addToast("Item deleted successfully", "success");
          setAPICall((e) => !e);
        })
        .catch((error) => {
          addToast(
            "Failed to delete item: " + (error.message || "Unknown error"),
            "error"
          );
        });
    },
    [addToast]
  );

  const handleEditSuccess = useCallback(() => {
    addToast("Item updated successfully", "success");
    setAPICall((e) => !e);
    setShowFrom(false);
  }, [addToast]);

  const handleEditFailure = useCallback(
    (error) => {
      addToast(
        "Failed to update item: " + (error.message || "Unknown error"),
        "error"
      );
    },
    [addToast]
  );

  const handleDateChange = useCallback(
    (key) => (e) => {
      const value = new Date(e.target.value).toISOString();
      setDate((prevDate) => ({
        ...prevDate,
        [key]: value,
      }));
    },
    []
  );

  const handleApply = useCallback(() => {
    IS_FETCH_ALL_DATA = false;
    setAPICall((e) => !e);
  }, []);

  const handleAll = useCallback(() => {
    IS_FETCH_ALL_DATA = true;
    setAPICall((e) => !e);
  }, []);

  const [filters, setFilters] = useState({
    category: "",
    name: "",
    minAmount: "",
    maxAmount: "",
    noteSearch: "",
  });

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const filteredTableData = useMemo(() => {
    if (!tableData || !tableData.data || type === EXPENSE_TYPE.DASHBOARD)
      return tableData?.data || [];

    return tableData.data.filter((item) => {
      const categoryMatch =
        type === EXPENSE_TYPE.DEBT
          ? !filters.name || item.name === filters.name
          : !filters.category || item.category === filters.category;

      const minAmount =
        filters.minAmount !== "" ? parseFloat(filters.minAmount) : null;
      const maxAmount =
        filters.maxAmount !== "" ? parseFloat(filters.maxAmount) : null;

      const amountMatch =
        (minAmount === null || item.amount >= minAmount) &&
        (maxAmount === null || item.amount <= maxAmount);

      const noteMatch =
        !filters.noteSearch ||
        (item.note &&
          item.note.toLowerCase().includes(filters.noteSearch.toLowerCase()));

      return categoryMatch && amountMatch && noteMatch;
    });
  }, [tableData, filters, type]);

  const filteredDashboardData = useMemo(() => {
    if (type === EXPENSE_TYPE.DASHBOARD) return dashboardData;
    if (!filteredTableData.length) return {};

    let temp = {};
    filteredTableData.forEach((item) => {
      const key = type === EXPENSE_TYPE.DEBT ? item.name : item.category;
      temp[key] = (temp[key] || 0) + item.amount;
    });
    return temp;
  }, [filteredTableData, type, dashboardData]);

  const handleAddSuccess = useCallback(
    (newItem) => {
      setTableData((prevTableData) => ({
        ...prevTableData,
        data: [newItem, ...(prevTableData.data || [])],
      }));

      setDashboardData((prevDashboardData) => {
        const key =
          type === EXPENSE_TYPE.DEBT ? newItem.name : newItem.category;
        return {
          ...prevDashboardData,
          [key]: (prevDashboardData[key] || 0) + newItem.amount,
          BALANCE: (prevDashboardData.BALANCE || 0) + newItem.amount,
        };
      });
    },
    [type, setTableData, setDashboardData]
  );

  return (
    <>
      <SquareLoader loading={loading} msg={".............."} />
      <Link to="/tracking" className="btn-primary">
        Tracking
      </Link>

      <AddButton
        type={type}
        show={showForm}
        setShowFrom={setShowFrom}
        editData={editDataRef.current}
        setAPICall={setAPICall}
        nameSuggestions={nameSuggestions}
        onEditSuccess={handleEditSuccess}
        onEditFailure={handleEditFailure}
        onAddSuccess={handleAddSuccess}
      />
      <div className="dashboard">
        <h3>{type}</h3>
        <div className="dashboardHeader">
          <div className="dateInputs">
            <input
              type="date"
              onChange={handleDateChange("start")}
              value={date.start.substring(0, 10)}
            />
            <input
              type="date"
              value={date.end.substring(0, 10)}
              onChange={handleDateChange("end")}
            />
          </div>
          <div className="button-group">
            <button onClick={handleApply}>Apply Filter</button>
            <button onClick={handleAll} className="secondary">
              Show All
            </button>
          </div>
          {type !== EXPENSE_TYPE.DASHBOARD && (
            <FilterComponent
              filters={filters}
              onFilterChange={handleFilterChange}
              categories={Array.from(
                new Set(
                  tableData?.data?.map((item) =>
                    type === EXPENSE_TYPE.DEBT ? item.name : item.category
                  ) || []
                )
              )}
              isDebtType={type === EXPENSE_TYPE.DEBT}
            />
          )}
        </div>
        {type === EXPENSE_TYPE.DEBT && <p>positive means I need to give</p>}
        <div className="priceCardContainer">
          {filteredDashboardData &&
            Object.entries(filteredDashboardData).map(([key, value]) => (
              <PriceCard
                key={key}
                type={type}
                title={key}
                amount={value}
                showLink={true}
                date={date}
              />
            ))}
        </div>
        {type !== EXPENSE_TYPE.DASHBOARD && filteredTableData.length ? (
          <Table
            heading={tableData.heading}
            data={filteredTableData}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ) : null}
      </div>
    </>
  );
}

function PriceCard({ type, title, amount, showLink, date }) {
  const queryParams = new URLSearchParams();
  queryParams.set("start", date.start);
  queryParams.set("end", date.end);
  queryParams.set("all", IS_FETCH_ALL_DATA);

  function CardWrapper() {
    return (
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
    );
  }

  const urlKey = type === EXPENSE_TYPE.DEBT ? "name" : "category";

  return showLink ? (
    <a
      href={
        URL_MAPPER[title]
          ? `${URL_MAPPER[title]}?${queryParams.toString()}`
          : `?${queryParams.toString()}&${urlKey}=${title}`
      }
    >
      <CardWrapper />
    </a>
  ) : (
    <CardWrapper />
  );
}

function useFeatchData(type, apiCall, date, name, category, all) {
  const [dashboardData, setDashboardData] = useState([]);
  const [tableData, setTableData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (date && date.start) {
      queryParams.set("start", date.start);
      queryParams.set("end", date.end);
    }
    if (all === true || all === "true") {
      queryParams.set("all", all);
    }
    if (
      name &&
      [
        EXPENSE_TYPE.DEBT,
        EXPENSE_TYPE.DEBT_BOUGHT,
        EXPENSE_TYPE.DEBT_GIVEN,
        EXPENSE_TYPE.EXPENSE,
      ].includes(type)
    ) {
      queryParams.set("name", name);
    }
    if (
      category &&
      [
        EXPENSE_TYPE.DEBT,
        EXPENSE_TYPE.DEBT_BOUGHT,
        EXPENSE_TYPE.DEBT_GIVEN,
        EXPENSE_TYPE.EXPENSE,
      ].includes(type)
    ) {
      queryParams.set("category", category);
    }
    const params = queryParams.toString();

    API.getExpense(type, params)
      .then((res) => {
        let temp = {};
        if (type === EXPENSE_TYPE.DASHBOARD) {
          temp = {
            INCOME: 0,
            BALANCE: 0,
            EXPENSE: 0,
          };
          res.data.data.group.forEach((obj) => {
            temp.BALANCE += obj.amount;
            temp[obj._id] = obj.amount;
          });
        } else {
          res.data.data.group.forEach((obj) => {
            temp[obj._id] = obj.amount;
          });
        }

        const heading = [
          "name",
          "amount",
          "note",
          "category",
          "type",
          "eventDate",
        ];

        setTableData({ heading, data: res.data.data.content });
        setDashboardData(temp);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [apiCall]);

  return { loading, dashboardData, tableData, setDashboardData, setTableData };
}

export default Dashboard;
