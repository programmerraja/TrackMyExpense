import React, { useEffect, useState } from "react";
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
import API from "../../utils/API";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

const GoldRateChart = ({ goldRate }) => {
  const chartData = {
    labels: goldRate.map((entry) => entry.date),
    datasets: [
      {
        label: "18KT",
        data: goldRate.map((entry) => entry.gold18KT),
        borderColor: "#FF8C42",
        backgroundColor: "rgba(255, 140, 66, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#FF8C42",
      },
      {
        label: "22KT",
        data: goldRate.map((entry) => entry.gold22KT),
        borderColor: "#FFD700",
        backgroundColor: "rgba(255, 215, 0, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#FFD700",
      },
      {
        label: "24KT",
        data: goldRate.map((entry) => entry.gold24KT),
        borderColor: "#DAA520",
        backgroundColor: "rgba(218, 165, 32, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#DAA520",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          padding: 20,
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
          text: "Price (₹)",
          font: { size: 14 },
        },
        ticks: {
          font: { size: 12 },
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
        ticks: {
          font: { size: 12 },
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
        height: "300px",
        margin: "2rem",
        padding: "0rem",
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

export default GoldRateChart;
