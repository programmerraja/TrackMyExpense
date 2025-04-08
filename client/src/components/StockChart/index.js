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

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
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
  return colors[Math.floor(Math.random() * colors.length)];
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

const FolioChart = ({ folio = [] }) => {
  if (!folio.length) return null;

  const labels = folio[0].data.map(([timestamp]) => formatDate(timestamp));

  const datasets = folio.map((f, i) => ({
    label: f.name,
    data: f.data.map(([_, value]) => value),
    borderColor: getColor(i),
    backgroundColor: getColor(i) + "33",
    fill: true,
    tension: 0.4,
    pointRadius: 4,
    pointBackgroundColor: getColor(i),
    pointHoverRadius: 6,
  }));

  const chartData = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 7,
          padding: 7,
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
          // text: "Price (₹)",
          // font: { size: 14 },
        },
        // ticks: {
        //   font: { size: 12 },
        // },
        grid: {
          color: "#eee",
        },
      },
      x: {
        title: {
          display: true,
          // text: "Date",
          // font: { size: 14 },
        },
        // ticks: {
        //   font: { size: 12 },
        // },
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

export default FolioChart;
