import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useLocation, Link } from "react-router-dom";
import { useToast } from "../Toast";

import { SquareLoader, Table, AddButton, FilterComponent } from "..";
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

const TYPE_LABELS = {
  DASHBOARD: "Dashboard",
  INCOME: "Income",
  EXPENSE: "Expenses",
  DEBT: "Debt",
  DEBT_BOUGHT: "Debt",
  DEBT_GIVEN: "Debt",
  INVESTMENT: "Investment",
  INCOME_TAX: "Income Tax",
};

const AMOUNT_COLOR_MAP = {
  INCOME: "#22c55e",
  EXPENSE: "#ef4444",
  INVESTMENT: "#3b82f6",
  BALANCE: "#a78bfa",
  DEBT: "#f59e0b",
  DEBT_BOUGHT: "#f59e0b",
  DEBT_GIVEN: "#f59e0b",
};

function Dashboard({ type }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [apiCall, setAPICall] = useState(false);
  const [showForm, setShowFrom] = useState(false);
  const [isFetchAllData, setIsFetchAllData] = useState(
    queryParams.get("all") === "true",
  );
  const [date, setDate] = useState({
    start: queryParams.get("start")
      ? new Date(queryParams.get("start")).toISOString()
      : new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1,
        ).toISOString(),
    end: queryParams.get("end")
      ? new Date(queryParams.get("end")).toISOString()
      : new Date().toISOString(),
  });

  const editDataRef = useRef(undefined);

  const {
    loading,
    error,
    dashboardData,
    tableData,
    setDashboardData,
    setTableData,
  } = useFeatchData(
    type,
    apiCall,
    date,
    queryParams.get("name"),
    queryParams.get("category"),
    isFetchAllData,
  );

  useEffect(() => {
    // Automatically process recurring expenses on mount
    API.processRecurring()
      .then((res) => {
        if (res.data.success && res.data.created > 0) {
          addToast(
            `Successfully auto-created ${res.data.created} recurring expenses!`,
            "success",
          );
          setAPICall((e) => !e); // Refetch data to show new items
        }
      })
      .catch((err) => {
        console.error("Failed to process recurring expenses:", err);
      });
  }, []); // Only run once on mount

  const nameSuggestions = useMemo(
    () =>
      tableData && tableData.data
        ? Array.from(new Set(tableData.data.map((obj) => obj.name)))
        : [],
    [tableData],
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
            "error",
          );
        });
    },
    [addToast],
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
        "error",
      );
    },
    [addToast],
  );

  const handleDateChange = useCallback(
    (key) => (e) => {
      const value = new Date(e.target.value).toISOString();
      setDate((prevDate) => ({
        ...prevDate,
        [key]: value,
      }));
    },
    [],
  );

  const handleApply = useCallback(() => {
    setIsFetchAllData(false);
    setAPICall((e) => !e);
  }, []);

  const handleAll = useCallback(() => {
    setIsFetchAllData(true);
    setAPICall((e) => !e);
  }, []);

  const handlePreset = useCallback((preset) => {
    const now = new Date();
    let start, end;
    switch (preset) {
      case "thisMonth":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
        break;
      case "lastMonth":
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "last3":
        start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        end = now;
        break;
      case "thisYear":
        start = new Date(now.getFullYear(), 0, 1);
        end = now;
        break;
      default:
        return;
    }
    setDate({ start: start.toISOString(), end: end.toISOString() });
    setIsFetchAllData(false);
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

  const handleExportCSV = useCallback(() => {
    const data =
      type === EXPENSE_TYPE.DASHBOARD
        ? tableData?.data || []
        : filteredTableData;
    if (!data.length) {
      addToast("No data to export", "error");
      return;
    }

    const headers = [
      "Name",
      "Amount",
      "Category",
      "Type",
      "Date",
      "Note",
      "Recurring",
    ];
    const escapeCSV = (val) => {
      if (val == null) return "";
      const str = String(val);
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    };

    const rows = data.map((item) => [
      escapeCSV(item.name),
      item.amount,
      escapeCSV(item.category),
      escapeCSV(item.type),
      item.eventDate
        ? new Date(item.eventDate).toLocaleDateString("en-IN")
        : "",
      escapeCSV(item.note),
      item.isRecurring ? `Yes (${item.recurringFrequency || "monthly"})` : "No",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(TYPE_LABELS[type] || type).toLowerCase()}_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast(`Exported ${rows.length} records`, "success");
  }, [type, tableData, filteredTableData, addToast]);

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
    [type, setTableData, setDashboardData],
  );

  return (
    <>
      <SquareLoader loading={loading} msg={"Loading your data..."} />

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
        <div className="dashboardTitleGroup">
          <h3>{TYPE_LABELS[type] || type}</h3>
          <span className="dashboardPeriod">
            {isFetchAllData
              ? "All Time"
              : new Date(date.start).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
          </span>
        </div>
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
            <button
              onClick={handleAll}
              className={isFetchAllData ? "" : "secondary"}
            >
              All Time
            </button>
            {type !== EXPENSE_TYPE.DASHBOARD && (
              <button
                onClick={handleExportCSV}
                className="secondary"
                title="Export to CSV"
              >
                📥 Export
              </button>
            )}
          </div>
          <div className="presetGroup">
            <button
              className="presetBtn"
              onClick={() => handlePreset("thisMonth")}
            >
              This Month
            </button>
            <button
              className="presetBtn"
              onClick={() => handlePreset("lastMonth")}
            >
              Last Month
            </button>
            <button className="presetBtn" onClick={() => handlePreset("last3")}>
              Last 3 Months
            </button>
            <button
              className="presetBtn"
              onClick={() => handlePreset("thisYear")}
            >
              This Year
            </button>
          </div>
          {type !== EXPENSE_TYPE.DASHBOARD && (
            <FilterComponent
              filters={filters}
              onFilterChange={handleFilterChange}
              categories={Array.from(
                new Set(
                  tableData?.data?.map((item) =>
                    type === EXPENSE_TYPE.DEBT ? item.name : item.category,
                  ) || [],
                ),
              )}
              isDebtType={type === EXPENSE_TYPE.DEBT}
            />
          )}
        </div>
        {type === EXPENSE_TYPE.DEBT && (
          <p className="debtHelperText">
            Positive amounts = money you owe &nbsp;|&nbsp; Negative amounts =
            money owed to you
          </p>
        )}
        {error && (
          <div className="emptyState">
            <p className="emptyStateIcon">⚠️</p>
            <p className="emptyStateTitle">Something went wrong</p>
            <p className="emptyStateSubtitle">{error}</p>
            <button onClick={() => setAPICall((e) => !e)}>Retry</button>
          </div>
        )}
        {!error &&
          !loading &&
          dashboardData &&
          Object.keys(dashboardData).length === 0 && (
            <div className="emptyState">
              <p className="emptyStateIcon">📊</p>
              <p className="emptyStateTitle">No data yet</p>
              <p className="emptyStateSubtitle">
                {type === EXPENSE_TYPE.DASHBOARD
                  ? "Start by adding your first income or expense"
                  : `No ${(TYPE_LABELS[type] || type).toLowerCase()} entries found for this period`}
              </p>
              <button onClick={() => setShowFrom(true)}>+ Add Entry</button>
            </div>
          )}
        <div className="priceCardContainer">
          {!error &&
            filteredDashboardData &&
            Object.entries(filteredDashboardData).map(([key, value]) => (
              <PriceCard
                key={key}
                type={type}
                title={key}
                amount={value}
                showLink={true}
                date={date}
                isFetchAllData={isFetchAllData}
              />
            ))}
        </div>
        {!error &&
        type !== EXPENSE_TYPE.DASHBOARD &&
        filteredTableData.length ? (
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

function PriceCard({ type, title, amount, showLink, date, isFetchAllData }) {
  const queryParams = new URLSearchParams();
  queryParams.set("start", date.start);
  queryParams.set("end", date.end);
  queryParams.set("all", isFetchAllData);

  const amountColor = AMOUNT_COLOR_MAP[title] || "#1a1a2e";

  function CardWrapper() {
    return (
      <div className="priceCard">
        <div className="d-flex">
          <h5 className="priceCardTitle">{TYPE_LABELS[title] || title}</h5>
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
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        </div>
        <h1 className="priceCardAmount" style={{ color: amountColor }}>
          ₹ {API.numberWithCommas(amount)}
        </h1>
      </div>
    );
  }

  const urlKey = type === EXPENSE_TYPE.DEBT ? "name" : "category";

  return showLink ? (
    <Link
      to={
        URL_MAPPER[title]
          ? `/${URL_MAPPER[title]}?${queryParams.toString()}`
          : `?${queryParams.toString()}&${urlKey}=${title}`
      }
      style={{ textDecoration: "none" }}
    >
      <CardWrapper />
    </Link>
  ) : (
    <CardWrapper />
  );
}

function useFeatchData(type, apiCall, date, name, category, all) {
  const [dashboardData, setDashboardData] = useState([]);
  const [tableData, setTableData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    setLoading(true);
    const queryParams = new URLSearchParams();
    if (all) {
      queryParams.set("all", true);
    } else if (date && date.start) {
      queryParams.set("start", date.start);
      queryParams.set("end", date.end);
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
        setError(
          error?.response?.data?.msg ||
            "Failed to load data. Please try again.",
        );
        setLoading(false);
      });
  }, [type, apiCall, date.start, date.end, name, category, all]);

  return {
    loading,
    error,
    dashboardData,
    tableData,
    setDashboardData,
    setTableData,
  };
}

export default Dashboard;
