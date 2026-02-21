import React, { useState, useRef, useEffect } from "react";
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
import { DEFAULT_COLORS } from "../../config/chartConfig";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
);

const extractNumericValue = (value) => {
  if (typeof value === "number") return value;

  if (typeof value === "string" && !isNaN(value)) return parseFloat(value);

  if (!value || typeof value !== "string") return 0;

  const numericValue = value.replace(/[^\d,.]/g, "").replace(/,/g, "");
  return parseFloat(numericValue) || 0;
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

const PriceChart = ({
  data,
  title = "",
  fields = [],
  labels = "date",
  colors = DEFAULT_COLORS,
  fieldLabels = {},
}) => {
  const chartRef = useRef(null);
  const [activeDatasets, setActiveDatasets] = useState([]);

  const dataFields =
    fields.length > 0
      ? fields
      : data && data.length > 0
        ? Object.keys(data[0]).filter((key) => key !== labels && key !== "date")
        : [];

  // Initialize active datasets with all fields
  useEffect(() => {
    setActiveDatasets(dataFields);
  }, [dataFields]);

  const toggleDataset = (field) => {
    setActiveDatasets((prev) => {
      if (prev.includes(field)) {
        // If it's the only active dataset, don't remove it
        if (prev.length === 1) return prev;
        return prev.filter((f) => f !== field);
      } else {
        return [...prev, field];
      }
    });
  };

  const chartData = {
    labels: data.map((entry) => entry[labels]),
    datasets: dataFields
      .filter((field) => activeDatasets.includes(field))
      .map((field) => {
        const colorIndex = dataFields.indexOf(field) % colors.length;
        return {
          label: fieldLabels[field] || field,
          data: data.map((entry) => extractNumericValue(entry[field])),
          borderColor: colors[colorIndex].borderColor,
          backgroundColor: colors[colorIndex].backgroundColor,
          fill: true,
          tension: 0.4,
          pointRadius: 2,
          pointBackgroundColor: colors[colorIndex].borderColor,
          borderWidth: 2,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: colors[colorIndex].borderColor,
          pointHoverBorderColor: "#ffffff",
          pointHoverBorderWidth: 2,
          pointStyle: "circle",
          lineTension: 0.4,
          cubicInterpolationMode: "monotone",
        };
      }),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      title: {
        display: false,
      },
      legend: {
        display: false,
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
        displayColors: true,
        boxPadding: 3,
        usePointStyle: true,
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
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2,
        fill: true,
      },
      point: {
        radius: 1,
        hoverRadius: 4,
        borderWidth: 2,
        hoverBorderWidth: 1,
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
    animation: {
      duration: 800,
      easing: "easeOutQuart",
    },
  };

  // Get the latest values for each dataset to display
  const getLatestValues = () => {
    const result = {};
    if (data.length > 0) {
      const latestEntry = data[data.length - 1];
      dataFields.forEach((field) => {
        result[field] = extractNumericValue(latestEntry[field]);
      });
    }
    return result;
  };

  const latestValues = getLatestValues();

  // Create legend items with colors
  const legendItems = dataFields.map((field, index) => {
    const colorIndex = index % colors.length;
    const isActive = activeDatasets.includes(field);

    return {
      field,
      label: fieldLabels[field] || field,
      color: colors[colorIndex].borderColor,
      value: latestValues[field],
      isActive,
    };
  });

  return (
    <div className="price-chart-container">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">{title}</h3>
          <p className="chart-subtitle">Latest values</p>
        </div>
        <div className="chart-legend">
          {legendItems.map((item, i) => (
            <div
              key={i}
              className={`legend-item ${item.isActive ? "active" : "inactive"}`}
              onClick={() => toggleDataset(item.field)}
            >
              <span
                className="legend-color"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="legend-label">
                {item.label}: {formatPrice(item.value || 0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-wrapper">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PriceChart;
