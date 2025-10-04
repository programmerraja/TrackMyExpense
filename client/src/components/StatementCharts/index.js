import React, { useState, useMemo, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import "./style.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const StatementCharts = ({
  transactions = [],
  chartSettings,
  onChartSettingsChange,
  loading = false,
}) => {
  const [selectedChartType, setSelectedChartType] = useState(
    chartSettings?.chartType || "bar"
  );
  const [selectedGroupBy, setSelectedGroupBy] = useState(
    chartSettings?.groupBy || "date"
  );
  const [selectedTimeRange, setSelectedTimeRange] = useState(
    chartSettings?.timeRange || "monthly"
  );

  const generateDateChartData = (transactions, timeRange) => {
    const grouped = {};

    transactions.forEach((txn) => {
      const date = new Date(txn.transactionDate);
      let key;

      switch (timeRange) {
        case "daily":
          key = date.toISOString().split("T")[0];
          break;
        case "weekly":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
          break;
        case "monthly":
        default:
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
          break;
      }

      if (!grouped[key]) {
        grouped[key] = { income: 0, expenses: 0, count: 0 };
      }

      if (txn.creditAmount > 0) {
        grouped[key].income += txn.creditAmount;
      } else {
        grouped[key].expenses += txn.debitAmount;
      }
      grouped[key].count += 1;
    });

    const sortedKeys = Object.keys(grouped).sort();

    return {
      labels: sortedKeys.map((key) => {
        const date = new Date(key);
        switch (timeRange) {
          case "daily":
            return date.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
            });
          case "weekly":
            return `Week of ${date.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
            })}`;
          case "monthly":
          default:
            return date.toLocaleDateString("en-IN", {
              month: "short",
              year: "numeric",
            });
        }
      }),
      datasets: [
        {
          label: "Income",
          data: sortedKeys.map((key) => grouped[key].income),
          backgroundColor: "rgba(40, 167, 69, 0.6)",
          borderColor: "rgba(40, 167, 69, 1)",
          borderWidth: 1,
        },
        {
          label: "Expenses",
          data: sortedKeys.map((key) => grouped[key].expenses),
          backgroundColor: "rgba(220, 53, 69, 0.6)",
          borderColor: "rgba(220, 53, 69, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const generateTypeChartData = (transactions) => {
    const income = transactions.filter((txn) => txn.creditAmount > 0);
    const expenses = transactions.filter((txn) => txn.debitAmount > 0);

    const incomeTotal = income.reduce((sum, txn) => sum + txn.creditAmount, 0);
    const expensesTotal = expenses.reduce(
      (sum, txn) => sum + txn.debitAmount,
      0
    );

    return {
      labels: ["Income", "Expenses"],
      datasets: [
        {
          data: [incomeTotal, expensesTotal],
          backgroundColor: ["rgba(40, 167, 69, 0.6)", "rgba(220, 53, 69, 0.6)"],
          borderColor: ["rgba(40, 167, 69, 1)", "rgba(220, 53, 69, 1)"],
          borderWidth: 1,
        },
      ],
    };
  };

  const generateAmountChartData = (transactions) => {
    const ranges = [
      { label: "0-1000", min: 0, max: 1000 },
      { label: "1000-5000", min: 1000, max: 5000 },
      { label: "5000-10000", min: 5000, max: 10000 },
      { label: "10000-50000", min: 10000, max: 50000 },
      { label: "50000+", min: 50000, max: Infinity },
    ];

    const rangeCounts = ranges.map((range) => ({
      label: range.label,
      count: transactions.filter((txn) => {
        const amount = txn.debitAmount > 0 ? txn.debitAmount : txn.creditAmount;
        return amount >= range.min && amount < range.max;
      }).length,
    }));

    return {
      labels: rangeCounts.map((r) => r.label),
      datasets: [
        {
          label: "Transaction Count",
          data: rangeCounts.map((r) => r.count),
          backgroundColor: [
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 99, 132, 0.6)",
            "rgba(255, 205, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(255, 205, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const generateNarrationChartData = (transactions) => {
    const grouped = {};

    transactions.forEach((txn) => {
      const narration = txn.narration || 'Unknown';
      const key = narration.length > 30 ? narration.substring(0, 30) + '...' : narration;

      if (!grouped[key]) {
        grouped[key] = { income: 0, expenses: 0, count: 0 };
      }

      if (txn.creditAmount > 0) {
        grouped[key].income += txn.creditAmount;
      } else {
        grouped[key].expenses += txn.debitAmount;
      }
      grouped[key].count += 1;
    });

    // Sort by total amount (income + expenses) descending and take top 10
    const sortedEntries = Object.entries(grouped)
      .sort(([, a], [, b]) => (b.income + b.expenses) - (a.income + a.expenses))
      .slice(0, 10);

    return {
      labels: sortedEntries.map(([key]) => key),
      datasets: [
        {
          label: "Income",
          data: sortedEntries.map(([, data]) => data.income),
          backgroundColor: "rgba(40, 167, 69, 0.6)",
          borderColor: "rgba(40, 167, 69, 1)",
          borderWidth: 1,
        },
        {
          label: "Expenses",
          data: sortedEntries.map(([, data]) => data.expenses),
          backgroundColor: "rgba(220, 53, 69, 0.6)",
          borderColor: "rgba(220, 53, 69, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const chartData = useMemo(() => {
    if (transactions.length === 0) return null;

    const filteredTransactions = transactions.filter((txn) => {
      const amount = txn.debitAmount > 0 ? txn.debitAmount : txn.creditAmount;
      return amount > 0;
    });

    if (filteredTransactions.length === 0) return null;

    switch (selectedGroupBy) {
      case "date":
        return generateDateChartData(filteredTransactions, selectedTimeRange);
      case "type":
        return generateTypeChartData(filteredTransactions);
      case "amount":
        return generateAmountChartData(filteredTransactions);
      case "narration":
        return generateNarrationChartData(filteredTransactions);
      default:
        return generateDateChartData(filteredTransactions, selectedTimeRange);
    }
  }, [transactions, selectedGroupBy, selectedTimeRange]);

  const handleChartTypeChange = useCallback(
    (type) => {
      setSelectedChartType(type);
      onChartSettingsChange({ chartType: type });
    },
    [onChartSettingsChange]
  );

  const handleGroupByChange = useCallback(
    (groupBy) => {
      setSelectedGroupBy(groupBy);
      onChartSettingsChange({ groupBy });
    },
    [onChartSettingsChange]
  );

  const handleTimeRangeChange = useCallback(
    (timeRange) => {
      setSelectedTimeRange(timeRange);
      onChartSettingsChange({ timeRange });
    },
    [onChartSettingsChange]
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `Transactions by ${
          selectedGroupBy === "date"
            ? "Date"
            : selectedGroupBy === "type"
            ? "Type"
            : selectedGroupBy === "amount"
            ? "Amount Range"
            : "Narration"
        }`,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.parsed.y || context.parsed;
            return `${context.dataset.label}: ₹${value.toLocaleString(
              "en-IN"
            )}`;
          },
        },
      },
    },
    scales:
      selectedChartType !== "pie"
        ? {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return "₹" + value.toLocaleString("en-IN");
                },
              },
            },
          }
        : undefined,
  };

  if (loading) {
    return (
      <div className="statement-charts-loading">
        <div className="spinner"></div>
        <p>Loading charts...</p>
      </div>
    );
  }

  if (!chartData || transactions.length === 0) {
    return (
      <div className="statement-charts-empty">
        <p>No transaction data available for charting.</p>
      </div>
    );
  }

  const renderChart = () => {
    switch (selectedChartType) {
      case "line":
        return <Line data={chartData} options={chartOptions} />;
      case "pie":
        return <Pie data={chartData} options={chartOptions} />;
      case "bar":
      default:
        return <Bar data={chartData} options={chartOptions} />;
    }
  };

  return (
    <div className="statement-charts">
      <div className="charts-header">
        <h3>Transaction Analysis</h3>
        <div className="chart-controls">
          <div className="control-group">
            <label>Chart Type:</label>
            <select
              value={selectedChartType}
              onChange={(e) => handleChartTypeChange(e.target.value)}
              className="chart-select"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
            </select>
          </div>

          <div className="control-group">
            <label>Group By:</label>
            <select
              value={selectedGroupBy}
              onChange={(e) => handleGroupByChange(e.target.value)}
              className="chart-select"
            >
              <option value="date">Date</option>
              <option value="type">Type</option>
              <option value="amount">Amount Range</option>
              <option value="narration">Narration</option>
            </select>
          </div>

          {selectedGroupBy === "date" && (
            <div className="control-group">
              <label>Time Range:</label>
              <select
                value={selectedTimeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className="chart-select"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="chart-container">{renderChart()}</div>
    </div>
  );
};

export default StatementCharts;
