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
import {
  PriceChart,
  FolioChart,
  SquareLoader,
  StockForm,
  StockCard,
  TradeForm,
} from "../components";
import { CHART_CONFIGS, DATA_TYPES } from "../config/chartConfig";
import "./MonthlyExpenseGraph.css";
import "./PriceTracking.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

function PriceTracking() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({});
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showStockForm, setShowStockForm] = useState(false);
  const [userStocks, setUserStocks] = useState([]);
  const [newStockSymbol, setNewStockSymbol] = useState("");
  const [newStockName, setNewStockName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("charts");
  const [holdings, setHoldings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [tradeFormType, setTradeFormType] = useState("BUY");
  const [selectedStockForTrade, setSelectedStockForTrade] = useState(null);

  const fetchPriceData = useCallback(() => {
    setLoading(true);
    Promise.all(
      ["gold", "silver", "mutual", "stock", "currency"].map((type) =>
        API.getPriceTracking(type)
          .then((data) => ({ type, data }))
          .catch((error) => {
            console.error(`Error fetching ${type} data:`, error);
            return { type, data: [], error };
          }),
      ),
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

  const fetchPortfolioData = useCallback(async () => {
    try {
      const [holdingsRes, transRes] = await Promise.all([
        API.getHoldings(),
        API.getTransactions(),
      ]);
      setHoldings(holdingsRes.data);
      setTransactions(transRes.data);
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
    }
  }, []);

  useEffect(() => {
    fetchPriceData();
    fetchUserStocks();
    if (activeTab === "portfolio") {
      fetchPortfolioData();
    }
  }, [
    fetchPriceData,
    fetchUserStocks,
    fetchPortfolioData,
    activeTab,
    refreshTrigger,
  ]);

  const handleAddStock = async (e) => {
    e.preventDefault();

    if (!newStockSymbol.trim() || !newStockName.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await API.addUserStock({
        name: newStockName,
        symbol: newStockSymbol.toUpperCase(),
      });

      setNewStockName("");
      setNewStockSymbol("");
      setRefreshTrigger((prev) => prev + 1);

      // Optionally close the form after successful addition
      setShowStockForm(false);
    } catch (error) {
      console.error("Error adding stock:", error);
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
      setNewStockName("");
      setNewStockSymbol("");
    }
  };

  const openTradeForm = (type, stock = null) => {
    setTradeFormType(type);
    setSelectedStockForTrade(stock);
    setShowTradeForm(true);
  };

  const handleTradeSuccess = () => {
    setShowTradeForm(false);
    setRefreshTrigger((prev) => prev + 1);
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
          />,
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
  const stocksWithPrices = userStocks.map((stock) => {
    const liveInfo =
      mockStockPrices[stock.symbol] ||
      chartData.stock?.find((s) => s.name === stock.name)?.data?.slice(-1)[0];

    // If it's from chartData, it's [timestamp, price]
    const currentPrice = Array.isArray(liveInfo)
      ? liveInfo[1]
      : liveInfo?.price || 0;
    const holding = holdings.find((h) => h.symbol === stock.symbol);

    return {
      ...stock,
      price: currentPrice,
      change: liveInfo?.change || 0,
      changePercent: liveInfo?.changePercent || 0,
      holding,
    };
  });

  const portfolioSummary = holdings.reduce(
    (acc, h) => {
      const stockInfo = stocksWithPrices.find((s) => s.symbol === h.symbol);
      const livePrice = stockInfo?.price || h.avgPrice;

      acc.totalInvested += h.totalCost;
      acc.currentValue += h.quantity * livePrice;
      acc.realizedPnL += h.realizedPnL;
      return acc;
    },
    { totalInvested: 0, currentValue: 0, realizedPnL: 0 },
  );

  portfolioSummary.unrealizedPnL =
    portfolioSummary.currentValue - portfolioSummary.totalInvested;
  portfolioSummary.totalReturn =
    portfolioSummary.realizedPnL + portfolioSummary.unrealizedPnL;
  portfolioSummary.returnPercent =
    portfolioSummary.totalInvested > 0
      ? (portfolioSummary.totalReturn / portfolioSummary.totalInvested) * 100
      : 0;

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
              className={`tab ${activeTab === "charts" ? "active" : ""}`}
              onClick={() => setActiveTab("charts")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                style={{ marginRight: "8px" }}
              >
                <path d="M4 11H2v3h2v-3zm5-4H7v7h2V7zm5-5v12h-2V2h2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3z" />
              </svg>
              Price Charts
            </button>
            <button
              className={`tab ${activeTab === "portfolio" ? "active" : ""}`}
              onClick={() => setActiveTab("portfolio")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                style={{ marginRight: "8px" }}
              >
                <path d="M14 3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h12zM2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H2z" />
                <path d="M2 5.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-1z" />
              </svg>
              My Portfolio
            </button>
            <button
              className={`tab ${activeTab === "manage" ? "active" : ""}`}
              onClick={() => setActiveTab("manage")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                style={{ marginRight: "8px" }}
              >
                <path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1V2zm1 12h2V2h-2v12zm-3 0V7H7v7h2zm-5 0v-3H2v3h2z" />
              </svg>
              Manage Stocks
            </button>
          </div>

          {activeTab === "manage" && (
            <div className="stock-dashboard">
              <div className="dashboard-header">
                <div>
                  <h2 className="dashboard-title">Your Stocks</h2>
                  <p className="dashboard-subtitle">
                    Track and manage your investment portfolio
                  </p>
                </div>
                <button className="add-new-stock-btn" onClick={toggleStockForm}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
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
                      <span className="help-text">
                        Enter the stock symbol as it appears on trading
                        platforms
                      </span>
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
                      {isSubmitting ? "Adding..." : "Add Stock"}
                    </button>
                  </form>
                </div>
              )}

              <div className="stocks-container">
                {stocksWithPrices.length === 0 ? (
                  <div className="user-stocks-empty">
                    <p>
                      You haven't added any stocks yet. Click "Add New Stock" to
                      get started.
                    </p>
                  </div>
                ) : (
                  stocksWithPrices.map((stock) => (
                    <StockCard
                      key={stock.symbol}
                      stock={stock}
                      onRemove={handleStockRemoved}
                      onTrade={(type) => openTradeForm(type, stock)}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "portfolio" && (
            <div className="portfolio-section">
              <div className="portfolio-summary">
                <div className="summary-card main-summary">
                  <div className="summary-label">Total Portfolio Value</div>
                  <div className="summary-value">
                    ₹{" "}
                    {API.numberWithCommas(
                      portfolioSummary.currentValue.toFixed(2),
                    )}
                  </div>
                  <div
                    className={`summary-change ${portfolioSummary.totalReturn >= 0 ? "positive-tag" : "negative-tag"}`}
                  >
                    {portfolioSummary.totalReturn >= 0 ? "+" : ""}₹{" "}
                    {API.numberWithCommas(
                      portfolioSummary.totalReturn.toFixed(2),
                    )}{" "}
                    ({portfolioSummary.returnPercent.toFixed(2)}%)
                  </div>
                </div>
                <div className="summary-grid">
                  <div className="summary-card">
                    <div className="summary-label">Invested Value</div>
                    <div className="summary-value secondary">
                      ₹{" "}
                      {API.numberWithCommas(
                        portfolioSummary.totalInvested.toFixed(2),
                      )}
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-label">Realized Profits</div>
                    <div
                      className={`summary-value ${portfolioSummary.realizedPnL >= 0 ? "positive" : "negative"}`}
                    >
                      ₹{" "}
                      {API.numberWithCommas(
                        portfolioSummary.realizedPnL.toFixed(2),
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="portfolio-content">
                <div className="section-header">
                  <h3>Active Holdings</h3>
                  <button
                    className="add-new-stock-btn"
                    onClick={() => openTradeForm("BUY")}
                    style={{ padding: "8px 16px", borderRadius: "10px" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                      style={{ marginRight: "6px" }}
                    >
                      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                    </svg>
                    Quick Buy
                  </button>
                </div>

                <div className="glass-table-container">
                  {holdings.length === 0 ? (
                    <div className="empty-state">
                      <div
                        style={{
                          fontSize: "2rem",
                          marginBottom: "10px",
                          opacity: 0.5,
                        }}
                      >
                        📊
                      </div>
                      No active holdings. Start by adding a BUY transaction.
                    </div>
                  ) : (
                    <table className="holdings-table">
                      <thead>
                        <tr>
                          <th>Stock</th>
                          <th>Qty</th>
                          <th>Avg. Price</th>
                          <th>Live Price</th>
                          <th>Value</th>
                          <th>P&L</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holdings.map((h) => {
                          const stockInfo = stocksWithPrices.find(
                            (s) => s.symbol === h.symbol,
                          );
                          const livePrice = stockInfo?.price || h.avgPrice;
                          const currentVal = h.quantity * livePrice;
                          const pnl = currentVal - h.totalCost;
                          const pnlPercent = (pnl / h.totalCost) * 100;

                          return (
                            <tr key={h.symbol}>
                              <td>
                                <div className="holding-name">{h.name}</div>
                                <div className="holding-symbol">{h.symbol}</div>
                              </td>
                              <td>{h.quantity}</td>
                              <td>₹ {h.avgPrice.toFixed(2)}</td>
                              <td>₹ {livePrice.toFixed(2)}</td>
                              <td>₹ {currentVal.toFixed(2)}</td>
                              <td
                                className={pnl >= 0 ? "positive" : "negative"}
                              >
                                <div>
                                  {pnl >= 0 ? "+" : ""}
                                  {pnl.toFixed(2)}
                                </div>
                                <div className="percent">
                                  ({pnlPercent.toFixed(2)}%)
                                </div>
                              </td>
                              <td>
                                <div className="table-actions">
                                  <button
                                    onClick={() => openTradeForm("BUY", h)}
                                  >
                                    Buy
                                  </button>
                                  <button
                                    className="btn-sell"
                                    onClick={() => openTradeForm("SELL", h)}
                                  >
                                    Sell
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="section-header" style={{ marginTop: "2rem" }}>
                  <h3>Recent Transactions</h3>
                </div>
                <div className="glass-table-container">
                  {transactions.length === 0 ? (
                    <div className="empty-state">
                      <div
                        style={{
                          fontSize: "2rem",
                          marginBottom: "10px",
                          opacity: 0.5,
                        }}
                      >
                        📜
                      </div>
                      No transaction history found.
                    </div>
                  ) : (
                    <table className="transactions-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Stock</th>
                          <th>Qty</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.slice(0, 10).map((tx) => (
                          <tr key={tx._id}>
                            <td>{new Date(tx.date).toLocaleDateString()}</td>
                            <td>
                              <span
                                className={
                                  tx.type === "BUY" ? "type-buy" : "type-sell"
                                }
                              >
                                {tx.type}
                              </span>
                            </td>
                            <td>{tx.symbol}</td>
                            <td>{tx.quantity}</td>
                            <td>₹ {tx.price.toFixed(2)}</td>
                            <td>₹ {(tx.quantity * tx.price).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {showTradeForm && (
            <TradeForm
              type={tradeFormType}
              stock={selectedStockForTrade}
              onSuccess={handleTradeSuccess}
              onCancel={() => setShowTradeForm(false)}
            />
          )}

          {activeTab === "charts" && (
            <div className="charts-section">
              <h2>Market Price Charts</h2>
              <p className="chart-description">
                Track historical price data for gold, silver, and other
                commodities
              </p>
              <div className="charts-grid">{renderCharts()}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PriceTracking;
