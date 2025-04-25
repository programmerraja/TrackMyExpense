import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import API from "../utils/API";
import { PriceChart, FolioChart, SquareLoader } from "../components";
import { CHART_CONFIGS, DATA_TYPES } from "../config/chartConfig";
import "./MonthlyExpenseGraph.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function PriceTracking() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all(
      DATA_TYPES.map(type =>
        API.getPriceTracking(type)
          .then(data => ({ type, data }))
          .catch(error => {
            console.error(`Error fetching ${type} data:`, error);
            return { type, data: [], error };
          })
      )
    )
      .then(results => {
        const dataMap = {};

        results.forEach(({ type, data }) => {
          dataMap[type] = data;
        });

        setChartData(dataMap);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching price data:", error);
        setError("Failed to load price data. Please try again later.");
        setLoading(false);
      });
  }, []);

  const renderCharts = () => {
    const charts = [];

    Object.entries(CHART_CONFIGS).forEach(([type, config]) => {
      if (chartData[type] && chartData[type].length > 0) {
        charts.push(
          <PriceChart
            key={`chart-${type}`}
            data={chartData[type]}
            title={config.title}
            fields={config.fields}
            colors={config.colors}
            yAxisLabel={config.yAxisLabel}
            fieldLabels={config.fieldLabels}
          />
        );
      }
    });

    const portfolioData = [...(chartData.mutual || []), ...(chartData.stock || [])];
    if (portfolioData.length > 0) {
      portfolioData.forEach((item, index) => {
        charts.push(
          <FolioChart key={`folio-${index}`} folio={[item]} />
        );
      });
    }

    return charts;
  };

  return (
    <div className="tracking">
      {loading ? (
        <SquareLoader loading={loading} msg="Loading price data..." />
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          {renderCharts()}
        </>
      )}
    </div>
  );
}

export default PriceTracking;
