import React from "react";
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
  Filler
);

const extractNumericValue = (value) => {
  if (typeof value === "number") return value;

  if (typeof value === "string" && !isNaN(value)) return parseFloat(value);

  if (!value || typeof value !== "string") return 0;

  const numericValue = value.replace(/[^\d,.]/g, "").replace(/,/g, "");
  return parseFloat(numericValue) || 0;
};

const PriceChart = ({
  data,
  title = "",
  fields = [],
  labels = "date",
  colors = DEFAULT_COLORS,
  yAxisLabel = "Price (₹)",
  fieldLabels = {},
}) => {
  const dataFields =
    fields.length > 0
      ? fields
      : data && data.length > 0
      ? Object.keys(data[0]).filter((key) => key !== labels && key !== "date")
      : [];

  const chartData = {
    labels: data.map((entry) => entry[labels]),
    datasets: dataFields.map((field, index) => {
      const colorIndex = index % colors.length;
      return {
        label: fieldLabels[field] || field,
        data: data.map((entry) => extractNumericValue(entry[field])),
        borderColor: colors[colorIndex].borderColor,
        backgroundColor: colors[colorIndex].backgroundColor,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: colors[colorIndex].borderColor,
      };
    }),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 8,
          font: {
            size: 14,
            family: "'Segoe UI', sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: "#333",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        cornerRadius: 6,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: yAxisLabel,
          font: { size: 14 },
        },
        grid: {
          color: "#eee",
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
          font: { size: 14 },
        },
        grid: {
          color: "#f9f9f9",
        },
      },
    },
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "600px",
        margin: "1rem",
        paddingTop: "1rem",
        borderRadius: "1rem",
        backgroundColor: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ height: "300px" }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PriceChart;
