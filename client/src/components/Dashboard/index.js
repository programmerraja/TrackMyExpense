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
import {
  EXPENSE_TYPE,
  FAMILY_CATEGORY,
  WORKSPACE_SCOPED_TYPES,
  URL_MAPPER,
  categoryLabel,
} from "../../constants/expense";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  PRESETS,
  formatDay,
  fromInputDate,
  matchingPreset,
  presetRange,
  toInputDate,
} from "../../utils/dateRange";

const TYPE_LABELS = {
  DASHBOARD: "Dashboard",
  INCOME: "Income",
  EXPENSE: "My Spending",
  FAMILY: "Sent Home",
  DEBT: "Debt",
  DEBT_BOUGHT: "Debt",
  DEBT_GIVEN: "Debt",
  INVESTMENT: "Investment",
  INCOME_TAX: "Income Tax",
};

const NAME_OR_CATEGORY_TYPES = [
  EXPENSE_TYPE.DEBT,
  EXPENSE_TYPE.DEBT_BOUGHT,
  EXPENSE_TYPE.DEBT_GIVEN,
  EXPENSE_TYPE.EXPENSE,
];

const CalendarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4 shrink-0 text-brand-400"
    aria-hidden="true"
  >
    <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
    <path d="M8 3v4m8-4v4M4 11h16" />
  </svg>
);

// Each bucket keeps its colour wherever it is shown.
const AMOUNT_CLASS_MAP = {
  INCOME: "text-money-in",
  EXPENSE: "text-money-out",
  FAMILY: "text-money-family",
  INVESTMENT: "text-money-tax",
  BALANCE: "text-slate-100",
  DEBT: "text-money-debt",
  DEBT_BOUGHT: "text-money-debt",
  DEBT_GIVEN: "text-money-debt",
};

function EmptyState({ icon, title, subtitle, actionLabel, onAction }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <p className="text-4xl">{icon}</p>
      <p className="mt-3 text-lg font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-400">{subtitle}</p>
      {actionLabel && (
        <button onClick={onAction} className="btn-primary mt-4">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function Dashboard({ type }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const { addToast } = useToast();
  const { activeWorkspace, activeWorkspaceId } = useWorkspace();
  const workspaceId =
    type === EXPENSE_TYPE.DASHBOARD || WORKSPACE_SCOPED_TYPES.includes(type)
      ? activeWorkspaceId
      : "";

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
    emergency,
    setDashboardData,
    setTableData,
  } = useFeatchData(
    type,
    apiCall,
    date,
    queryParams.get("name"),
    queryParams.get("category"),
    isFetchAllData,
    workspaceId,
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

  const handleDateChange = useCallback(
    (key) => (e) => {
      const value = fromInputDate(e.target.value);
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
    const range = presetRange(preset);
    if (!range) return;

    setDate({
      start: range.start.toISOString(),
      end: range.end.toISOString(),
    });
    setIsFetchAllData(false);
    setAPICall((e) => !e);
  }, []);

  const activePreset = useMemo(() => matchingPreset(date), [date]);

  const rangeLabel = isFetchAllData
    ? "All time"
    : `${formatDay(date.start)} – ${formatDay(date.end, true)}`;

  const [filters, setFilters] = useState({
    category: "",
    name: "",
    noteSearch: "",
  });

  const filteredTableData = useMemo(() => {
    if (!tableData || !tableData.data || type === EXPENSE_TYPE.DASHBOARD)
      return tableData?.data || [];

    return tableData.data.filter((item) => {
      const categoryMatch =
        type === EXPENSE_TYPE.DEBT
          ? !filters.name || item.name === filters.name
          : !filters.category || item.category === filters.category;

      const noteMatch =
        !filters.noteSearch ||
        (item.note &&
          item.note.toLowerCase().includes(filters.noteSearch.toLowerCase()));

      return categoryMatch && noteMatch;
    });
  }, [tableData, filters, type]);

  const handleExportCSV = useCallback(() => {
    if (!filteredTableData.length) {
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

    const rows = filteredTableData.map((item) => [
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
  }, [type, filteredTableData, addToast]);

  const filteredDashboardData = useMemo(() => {
    if (type === EXPENSE_TYPE.DASHBOARD) return dashboardData;
    if (!filteredTableData.length) return {};

    return filteredTableData.reduce((totals, item) => {
      const key = type === EXPENSE_TYPE.DEBT ? item.name : item.category;
      totals[key] = (totals[key] || 0) + item.amount;
      return totals;
    }, {});
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
        onAddSuccess={handleAddSuccess}
      />
      <div className="page-wide">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="page-title">{TYPE_LABELS[type] || type}</h1>
            {workspaceId && activeWorkspace && (
              <p className="page-subtitle">{activeWorkspace.name}</p>
            )}
          </div>
          {type !== EXPENSE_TYPE.DASHBOARD && (
            <button
              onClick={handleExportCSV}
              className="btn-ghost"
              title="Export to CSV"
            >
              Export CSV
            </button>
          )}
        </header>

        {/* The period every number below is answering, said once and said
            loudly, with the shortcut that produced it kept lit. */}
        <div className="card mb-5 flex flex-wrap items-center gap-x-4 gap-y-3 p-3">
          <p className="flex items-center gap-2 text-[15px] font-semibold text-slate-100 sm:text-base">
            <CalendarIcon />
            {rangeLabel}
          </p>
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                className={`chip ${
                  !isFetchAllData && activePreset === preset.id
                    ? "chip-active"
                    : ""
                }`}
                onClick={() => handlePreset(preset.id)}
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={handleAll}
              className={`chip ${isFetchAllData ? "chip-active" : ""}`}
            >
              All time
            </button>
          </div>
        </div>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="order-2 min-w-0 space-y-5 xl:order-1">
            {type === EXPENSE_TYPE.DEBT && (
              <p className="rounded-lg border-l-4 border-money-debt bg-money-debt/10 px-3 py-2.5 text-sm text-slate-300">
                Positive = money you owe · Negative = money owed to you
              </p>
            )}

            {error && (
              <EmptyState
                icon="⚠️"
                title="Something went wrong"
                subtitle={error}
                actionLabel="Retry"
                onAction={() => setAPICall((e) => !e)}
              />
            )}

            {!error &&
              !loading &&
              (!dashboardData ||
                (Object.keys(dashboardData).length === 0 &&
                  (!filteredTableData || filteredTableData.length === 0))) && (
                <EmptyState
                  icon="📊"
                  title="Nothing here yet"
                  subtitle={
                    type === EXPENSE_TYPE.DASHBOARD
                      ? "Add your first income or expense to get started"
                      : `No ${(TYPE_LABELS[type] || type).toLowerCase()} entries in this period`
                  }
                  actionLabel="Add entry"
                  onAction={() => setShowFrom(true)}
                />
              )}

            {!error && type === EXPENSE_TYPE.INCOME && emergency !== null && (
              <section className="card flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-money-tax p-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Emergency fund
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Balance today · all time, not this period
                  </p>
                </div>
                <p className="text-xl font-bold text-money-tax sm:text-2xl">
                  ₹{API.numberWithCommas(emergency) || 0}
                </p>
              </section>
            )}

            {!error && filteredDashboardData && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {Object.entries(filteredDashboardData).map(([key, value]) => (
                  <PriceCard
                    key={key}
                    type={type}
                    title={key}
                    amount={value}
                    date={date}
                    isFetchAllData={isFetchAllData}
                  />
                ))}
              </div>
            )}

            {!error &&
            type !== EXPENSE_TYPE.DASHBOARD &&
            filteredTableData.length ? (
              <Table
                data={filteredTableData}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ) : null}
          </div>

          <aside className="order-1 space-y-4 xl:order-2 xl:sticky xl:top-6">
            <section className="card p-4">
              {/* Date inputs have a wide intrinsic size, so they need min-w-0
                  or they overflow the card instead of shrinking. */}
              <div className="grid grid-cols-2 gap-2">
                <div className="min-w-0">
                  <label htmlFor="range-start" className="label">
                    From
                  </label>
                  <input
                    id="range-start"
                    type="date"
                    className="field min-w-0 px-2"
                    onChange={handleDateChange("start")}
                    value={toInputDate(date.start)}
                  />
                </div>
                <div className="min-w-0">
                  <label htmlFor="range-end" className="label">
                    To
                  </label>
                  <input
                    id="range-end"
                    type="date"
                    className="field min-w-0 px-2"
                    value={toInputDate(date.end)}
                    onChange={handleDateChange("end")}
                  />
                </div>
              </div>
              <button onClick={handleApply} className="btn-primary mt-3 w-full">
                Apply
              </button>
            </section>

            {type !== EXPENSE_TYPE.DASHBOARD && (
              <section className="card p-4">
                <FilterComponent
                  filters={filters}
                  onFilterChange={setFilters}
                  categories={Array.from(
                    new Set(
                      tableData?.data?.map((item) =>
                        type === EXPENSE_TYPE.DEBT ? item.name : item.category,
                      ) || [],
                    ),
                  )}
                  isDebtType={type === EXPENSE_TYPE.DEBT}
                />
              </section>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}

function PriceCard({ type, title, amount, date, isFetchAllData }) {
  const queryParams = new URLSearchParams();
  queryParams.set("start", date.start);
  queryParams.set("end", date.end);
  queryParams.set("all", isFetchAllData);

  const amountClass = AMOUNT_CLASS_MAP[title] || "text-slate-100";
  const urlKey = type === EXPENSE_TYPE.DEBT ? "name" : "category";

  if (title === "FAMILY") {
    queryParams.set("category", FAMILY_CATEGORY);
  }

  const href =
    title === "FAMILY"
      ? `/expense?${queryParams.toString()}`
      : URL_MAPPER[title]
        ? `/${URL_MAPPER[title]}?${queryParams.toString()}`
        : `?${queryParams.toString()}&${urlKey}=${title}`;

  return (
    <Link to={href} className="no-underline">
      <div className="card h-full p-4 transition hover:border-white/15 hover:bg-ink-800">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-400">
          {TYPE_LABELS[title] || categoryLabel(title)}
        </p>
        <p className={`mt-1.5 text-lg font-bold sm:text-xl ${amountClass}`}>
          ₹{API.numberWithCommas(amount) || 0}
        </p>
      </div>
    </Link>
  );
}

function useFeatchData(type, apiCall, date, name, category, all, workspaceId) {
  const [dashboardData, setDashboardData] = useState({});
  const [tableData, setTableData] = useState({});
  const [emergency, setEmergency] = useState(null);
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
    if (name && NAME_OR_CATEGORY_TYPES.includes(type)) {
      queryParams.set("name", name);
    }
    if (category && NAME_OR_CATEGORY_TYPES.includes(type)) {
      queryParams.set("category", category);
    }
    const params = queryParams.toString();

    API.getExpense(type, params, workspaceId)
      .then((res) => {
        let temp = {};
        if (type === EXPENSE_TYPE.DASHBOARD) {
          temp = {
            INCOME: 0,
            BALANCE: 0,
            EXPENSE: 0,
            FAMILY: 0,
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

        setTableData({ data: res.data.data.content });
        setDashboardData(temp);
        setEmergency(res.data.data.emergency ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(
          error?.response?.data?.error ||
          error?.response?.data?.msg ||
            "Failed to load data. Please try again.",
        );
        setLoading(false);
      });
  }, [
    type,
    apiCall,
    date.start,
    date.end,
    name,
    category,
    all,
    workspaceId,
  ]);

  return {
    loading,
    error,
    dashboardData,
    tableData,
    emergency,
    setDashboardData,
    setTableData,
  };
}

export default Dashboard;
