import React, { useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "../PriceChart/PriceChart.css";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
);

const getColor = (index) => {
  const colors = [
    "#36A2EB",
    "#FF6384",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#66CDAA",
    "#CD5C5C",
  ];
  // Use the index if provided, otherwise use a random color
  return (
    colors[index % colors.length] ||
    colors[Math.floor(Math.random() * colors.length)]
  );
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })
    .format(price)
    .replace("₹", "₹ ");
};

const FolioChart = ({ folio = [] }) => {
  const chartRef = useRef(null);

  if (!folio.length) return null;

  const labels = folio[0].data.map(([timestamp]) => formatDate(timestamp));

  const datasets = folio.map((f, i) => ({
    label: f.name,
    data: f.data.map(([_, value]) => value),
    borderColor: getColor(i),
    backgroundColor: getColor(i) + "15", // More transparent background
    fill: true,
    tension: 0.4,
    pointRadius: 2,
    pointBackgroundColor: getColor(i),
    pointHoverRadius: 5,
    borderWidth: 2,
  }));

  const chartData = {
    labels,
    datasets,
  };

  // Get the latest value for display
  const getLatestValue = () => {
    if (folio.length > 0 && folio[0].data.length > 0) {
      const latestData = folio[0].data[folio[0].data.length - 1];
      return latestData[1]; // The value is the second element in the data array
    }
    return 0;
  };

  const latestValue = getLatestValue();

  // Calculate change from previous value
  const calculateChange = () => {
    if (folio.length > 0 && folio[0].data.length > 1) {
      const currentValue = folio[0].data[folio[0].data.length - 1][1];
      const previousValue = folio[0].data[folio[0].data.length - 2][1];
      return {
        amount: currentValue - previousValue,
        percent: ((currentValue - previousValue) / previousValue) * 100,
      };
    }
    return { amount: 0, percent: 0 };
  };

  const change = calculateChange();
  const isPositive = change.amount >= 0;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend to save space
      },
      tooltip: {
        backgroundColor: "rgba(33, 37, 41, 0.9)",
        titleFont: {
          size: 12,
          family: "'Poppins', 'Segoe UI', sans-serif",
          weight: "bold",
        },
        bodyFont: {
          size: 11,
          family: "'Poppins', 'Segoe UI', sans-serif",
        },
        padding: 8,
        cornerRadius: 4,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += formatPrice(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        display: true,
        title: {
          display: false,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
          drawBorder: false,
        },
        ticks: {
          padding: 4,
          font: {
            size: 10,
            family: "'Lato', sans-serif",
          },
          color: "rgba(255, 255, 255, 0.7)",
          maxTicksLimit: 5,
          callback: function (value) {
            return value.toLocaleString("en-IN");
          },
        },
        border: {
          display: false,
        },
      },
      x: {
        display: true,
        title: {
          display: false,
        },
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          padding: 4,
          font: {
            size: 9,
            family: "'Lato', sans-serif",
          },
          color: "rgba(255, 255, 255, 0.7)",
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6,
        },
      },
    },
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 5,
        bottom: 0,
      },
    },
  };

  return (
    <div className="folio-chart-container">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">{folio[0].name}</h3>
          <p className="chart-subtitle">Stock Performance</p>
        </div>
        <div>
          <div className="stock-price">
            ₹{latestValue.toLocaleString("en-IN")}
          </div>
          <div
            className={`stock-change ${isPositive ? "positive" : "negative"}`}
          >
            {isPositive ? "+" : ""}
            {change.amount.toFixed(2)} ({isPositive ? "+" : ""}
            {change.percent.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div className="chart-wrapper">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default FolioChart;
