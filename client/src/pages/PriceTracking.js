import React, { useState, useEffect, useCallback } from "react";
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
import StockForm from "../components/StockForm";
import StockCard from "../components/StockCard";
import { CHART_CONFIGS, DATA_TYPES } from "../config/chartConfig";
import "./MonthlyExpenseGraph.css";
import "./PriceTracking.css";

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showStockForm, setShowStockForm] = useState(false);
  const [userStocks, setUserStocks] = useState([]);
  const [newStockSymbol, setNewStockSymbol] = useState('');
  const [newStockName, setNewStockName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('charts');

  const fetchPriceData = useCallback(() => {
    setLoading(true);
    Promise.all(
      DATA_TYPES.map((type) =>
        API.getPriceTracking(type)
          .then((data) => ({ type, data }))
          .catch((error) => {
            console.error(`Error fetching ${type} data:`, error);
            return { type, data: [], error };
          })
      )
    )
      .then((results) => {
        const dataMap = {};

        results.forEach(({ type, data }) => {
          dataMap[type] = data;
        });

        setChartData(dataMap);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching price data:", error);
        setError("Failed to load price data. Please try again later.");
        setLoading(false);
      });
  }, []);

  const fetchUserStocks = useCallback(async () => {
    try {
      const response = await API.getUserStocks();
      setUserStocks(response.data);
    } catch (error) {
      console.error("Error fetching user stocks:", error);
    }
  }, []);

  useEffect(() => {
    fetchPriceData();
    fetchUserStocks();
  }, [fetchPriceData, refreshTrigger]);

  const handleAddStock = async (e) => {
    e.preventDefault();

    if (!newStockSymbol.trim() || !newStockName.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await API.addUserStock({
        name: newStockName,
        symbol: newStockSymbol.toUpperCase()
      });

      setNewStockName('');
      setNewStockSymbol('');
      setRefreshTrigger((prev) => prev + 1);

      // Optionally close the form after successful addition
      setShowStockForm(false);
    } catch (error) {
      console.error('Error adding stock:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockRemoved = async (symbol) => {
    try {
      await API.removeUserStock(symbol);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error removing stock:", error);
    }
  };

  const toggleStockForm = () => {
    setShowStockForm((prev) => !prev);
    // Reset form fields when toggling
    if (!showStockForm) {
      setNewStockName('');
      setNewStockSymbol('');
    }
  };

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

    const portfolioData = [
      ...(chartData.mutual || []),
      ...(chartData.stock || []),
    ];
    if (portfolioData.length > 0) {
      portfolioData.forEach((item, index) => {
        charts.push(<FolioChart key={`folio-${index}`} folio={[item]} />);
      });
    }

    return charts;
  };

  // Mock data for stock prices (in a real app, this would come from the API)
  const mockStockPrices = {
    AAPL: { price: 277.86, change: 4.53, changePercent: 1.66 },
    MSFT: { price: 268.64, change: 3.02, changePercent: 1.14 },
    GOOGL: { price: 231.46, change: 3.76, changePercent: 1.65 },
  };

  // Combine user stocks with price data
  const stocksWithPrices = userStocks.map(stock => ({
    ...stock,
    price: mockStockPrices[stock.symbol]?.price || 0,
    change: mockStockPrices[stock.symbol]?.change || 0,
    changePercent: mockStockPrices[stock.symbol]?.changePercent || 0,
  }));

  return (
    <div className="tracking">
      {loading ? (
        <SquareLoader loading={loading} msg="Loading price data..." />
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="page-header">
            <h1>Stock Dashboard</h1>
            <p className="subtitle">Track and manage your stock portfolio</p>
          </div>

          <div className="tabs">
            <button
              className={`tab ${activeTab === 'charts' ? 'active' : ''}`}
              onClick={() => setActiveTab('charts')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{marginRight: '8px'}}>
                <path d="M4 11H2v3h2v-3zm5-4H7v7h2V7zm5-5v12h-2V2h2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3z"/>
              </svg>
              Price Charts
            </button>
            <button
              className={`tab ${activeTab === 'manage' ? 'active' : ''}`}
              onClick={() => setActiveTab('manage')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{marginRight: '8px'}}>
                <path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1V2zm1 12h2V2h-2v12zm-3 0V7H7v7h2zm-5 0v-3H2v3h2z"/>
              </svg>
              Manage Stocks
            </button>
          </div>

          {activeTab === 'manage' && (
            <div className="stock-dashboard">
              <div className="dashboard-header">
                <div>
                  <h2 className="dashboard-title">Your Stocks</h2>
                  <p className="dashboard-subtitle">Track and manage your investment portfolio</p>
                </div>
                <button className="add-new-stock-btn" onClick={toggleStockForm}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                  </svg>
                  Add New Stock
                </button>
              </div>

              {showStockForm && (
                <div className="add-stock-section">
                  <h2>Add Stock to Your Portfolio</h2>
                  <form onSubmit={handleAddStock} className="add-stock-form">
                    <div className="form-group">
                      <label htmlFor="stockSymbol">Stock Symbol</label>
                      <input
                        type="text"
                        id="stockSymbol"
                        placeholder="e.g., AAPL"
                        value={newStockSymbol}
                        onChange={(e) => setNewStockSymbol(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                      <span className="help-text">Enter the stock symbol as it appears on trading platforms</span>
                    </div>
                    <div className="form-group">
                      <label htmlFor="stockName">Display Name</label>
                      <input
                        type="text"
                        id="stockName"
                        placeholder="e.g., Apple Inc."
                        value={newStockName}
                        onChange={(e) => setNewStockName(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="add-stock-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Adding...' : 'Add Stock'}
                    </button>
                  </form>
                </div>
              )}

              <div className="stocks-container">
                {stocksWithPrices.length === 0 ? (
                  <div className="user-stocks-empty">
                    <p>You haven't added any stocks yet. Click "Add New Stock" to get started.</p>
                  </div>
                ) : (
                  stocksWithPrices.map(stock => (
                    <StockCard
                      key={stock.symbol}
                      stock={stock}
                      onRemove={handleStockRemoved}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'charts' && (
            <div className="charts-section">
              <h2>Market Price Charts</h2>
              <p className="chart-description">
                Track historical price data for gold, silver, and other commodities
              </p>
              <div className="charts-grid">
                {renderCharts()}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PriceTracking;
