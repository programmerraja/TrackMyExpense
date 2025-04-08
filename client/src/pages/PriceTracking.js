import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import GoldRateChart from "../components/GoldRates";
import FolioChart from "../components/StockChart";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Link } from "react-router-dom";
import API from "../utils/API";
import SquareLoader from "../components/SquareLoader";
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

  const [goldRate, setGoldRate] = useState([]);
  const [mutulaFundRate, setMutulaFundRate] = useState([]);
  const [stockRate, setStockRate] = useState([]);

  useEffect(() => {
    Promise.all([
      API.getPriceTracking(),
      API.getPriceTracking("mutual"),
      API.getPriceTracking("stock"),
    ]).then(([gold, mutual, stock]) => {
      setLoading(false);
      setGoldRate(gold);
      setMutulaFundRate(mutual);
      setStockRate(stock);
    });
  }, []);

  return (
    <div className="monthly-expense-graph">
      <h1>Price Tracking</h1>
      <Link to="/dashboard" className="btn btn-primary">
        Back to Dashboard
      </Link>
      {loading ? (
        <SquareLoader loading={loading} msg="Loading expenses..." />
      ) : (
        <div className="d-flex d-flex-direction">
          <GoldRateChart goldRate={goldRate}></GoldRateChart>
          {[...mutulaFundRate, ...stockRate].map((k) => {
            return <FolioChart folio={[k]} />;
          })}
        </div>
      )}
    </div>
  );
}

export default PriceTracking;
