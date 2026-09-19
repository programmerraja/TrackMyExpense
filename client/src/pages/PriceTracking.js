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
  StockCard,
  TradeForm,
} from "../components";
import { CHART_CONFIGS } from "../config/chartConfig";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const TABS = [
  { id: "charts", label: "Price charts" },
  { id: "portfolio", label: "My portfolio" },
  { id: "manage", label: "Manage stocks" },
];

const money = (value) => `₹${API.numberWithCommas(Number(value).toFixed(2))}`;

const signClass = (value) => (value >= 0 ? "text-money-in" : "text-money-out");

function SummaryCard({ label, value, valueClass = "text-slate-100", footer }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={`mt-1 truncate text-2xl font-bold ${valueClass}`}>{value}</p>
      {footer}
    </div>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <span className="text-3xl opacity-50">{icon}</span>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

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

  if (loading) {
    return <SquareLoader loading msg="Loading price data..." />;
  }

  return (
    <main className="page-wide">
      <header className="mb-5">
        <h1 className="page-title">Tracking</h1>
        <p className="page-subtitle">Market prices and your stock portfolio</p>
      </header>

      {error ? (
        <div className="card p-6 text-center text-money-out">{error}</div>
      ) : (
        <>
          <div className="mb-5 inline-flex gap-1 overflow-x-auto rounded-xl bg-ink-900 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? "tab-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "manage" && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold">Your stocks</h2>
                  <p className="mt-0.5 text-sm text-slate-400">
                    Watchlist and quick trades
                  </p>
                </div>
                <button className="btn-primary" onClick={toggleStockForm}>
                  {showStockForm ? "Cancel" : "Add stock"}
                </button>
              </div>

              {showStockForm && (
                <form onSubmit={handleAddStock} className="card p-4 sm:p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="stockSymbol" className="label">
                        Stock symbol
                      </label>
                      <input
                        type="text"
                        id="stockSymbol"
                        className="field"
                        placeholder="e.g. AAPL"
                        value={newStockSymbol}
                        onChange={(e) => setNewStockSymbol(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="stockName" className="label">
                        Display name
                      </label>
                      <input
                        type="text"
                        id="stockName"
                        className="field"
                        placeholder="e.g. Apple Inc."
                        value={newStockName}
                        onChange={(e) => setNewStockName(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end border-t border-white/5 pt-4">
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Adding…" : "Add stock"}
                    </button>
                  </div>
                </form>
              )}

              {stocksWithPrices.length === 0 ? (
                <div className="card">
                  <EmptyState
                    icon="📈"
                    message="No stocks yet. Add one to start tracking."
                  />
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {stocksWithPrices.map((stock) => (
                    <StockCard
                      key={stock.symbol}
                      stock={stock}
                      onRemove={handleStockRemoved}
                      onTrade={(type) => openTradeForm(type, stock)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "portfolio" && (
            <section className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  label="Portfolio value"
                  value={money(portfolioSummary.currentValue)}
                  footer={
                    <p
                      className={`mt-1 text-sm font-semibold ${signClass(portfolioSummary.totalReturn)}`}
                    >
                      {portfolioSummary.totalReturn >= 0 ? "+" : "−"}
                      {money(Math.abs(portfolioSummary.totalReturn))} (
                      {portfolioSummary.returnPercent.toFixed(2)}%)
                    </p>
                  }
                />
                <SummaryCard
                  label="Invested"
                  value={money(portfolioSummary.totalInvested)}
                />
                <SummaryCard
                  label="Unrealised P&L"
                  value={money(portfolioSummary.unrealizedPnL)}
                  valueClass={signClass(portfolioSummary.unrealizedPnL)}
                />
                <SummaryCard
                  label="Realised P&L"
                  value={money(portfolioSummary.realizedPnL)}
                  valueClass={signClass(portfolioSummary.realizedPnL)}
                />
              </div>

              <div className="card overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-3">
                  <h2 className="font-semibold">Active holdings</h2>
                  <button
                    className="btn-primary"
                    onClick={() => openTradeForm("BUY")}
                  >
                    Quick buy
                  </button>
                </div>

                {holdings.length === 0 ? (
                  <EmptyState
                    icon="📊"
                    message="No active holdings. Start with a buy transaction."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[46rem] text-sm">
                      <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                        <tr className="border-b border-white/5">
                          <th className="px-4 py-2.5 font-semibold">Stock</th>
                          <th className="px-4 py-2.5 text-right font-semibold">
                            Qty
                          </th>
                          <th className="px-4 py-2.5 text-right font-semibold">
                            Avg price
                          </th>
                          <th className="px-4 py-2.5 text-right font-semibold">
                            Live price
                          </th>
                          <th className="px-4 py-2.5 text-right font-semibold">
                            Value
                          </th>
                          <th className="px-4 py-2.5 text-right font-semibold">
                            P&L
                          </th>
                          <th className="px-4 py-2.5 text-right font-semibold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {holdings.map((h) => {
                          const stockInfo = stocksWithPrices.find(
                            (s) => s.symbol === h.symbol,
                          );
                          const livePrice = stockInfo?.price || h.avgPrice;
                          const currentVal = h.quantity * livePrice;
                          const pnl = currentVal - h.totalCost;
                          const pnlPercent = (pnl / h.totalCost) * 100;

                          return (
                            <tr key={h.symbol} className="hover:bg-white/[0.02]">
                              <td className="px-4 py-3">
                                <p className="font-semibold">{h.name}</p>
                                <p className="text-xs text-slate-500">
                                  {h.symbol}
                                </p>
                              </td>
                              <td className="px-4 py-3 text-right tabular-nums">
                                {h.quantity}
                              </td>
                              <td className="px-4 py-3 text-right tabular-nums">
                                {money(h.avgPrice)}
                              </td>
                              <td className="px-4 py-3 text-right tabular-nums">
                                {money(livePrice)}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold tabular-nums">
                                {money(currentVal)}
                              </td>
                              <td
                                className={`px-4 py-3 text-right font-semibold tabular-nums ${signClass(pnl)}`}
                              >
                                <div>
                                  {pnl >= 0 ? "+" : "−"}
                                  {money(Math.abs(pnl))}
                                </div>
                                <div className="text-xs font-medium opacity-80">
                                  {pnlPercent.toFixed(2)}%
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-end gap-2">
                                  <button
                                    className="btn-ghost h-8 px-3"
                                    onClick={() => openTradeForm("BUY", h)}
                                  >
                                    Buy
                                  </button>
                                  <button
                                    className="btn-danger h-8 px-3"
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
                  </div>
                )}
              </div>

              <div className="card overflow-hidden">
                <div className="border-b border-white/5 px-4 py-3">
                  <h2 className="font-semibold">Recent transactions</h2>
                </div>
                {transactions.length === 0 ? (
                  <EmptyState icon="📜" message="No transaction history yet." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[38rem] text-sm">
                      <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                        <tr className="border-b border-white/5">
                          <th className="px-4 py-2.5 font-semibold">Date</th>
                          <th className="px-4 py-2.5 font-semibold">Type</th>
                          <th className="px-4 py-2.5 font-semibold">Stock</th>
                          <th className="px-4 py-2.5 text-right font-semibold">
                            Qty
                          </th>
                          <th className="px-4 py-2.5 text-right font-semibold">
                            Price
                          </th>
                          <th className="px-4 py-2.5 text-right font-semibold">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {transactions.slice(0, 10).map((tx) => (
                          <tr key={tx._id} className="hover:bg-white/[0.02]">
                            <td className="px-4 py-3 text-slate-400">
                              {new Date(tx.date).toLocaleDateString("en-IN")}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                  tx.type === "BUY"
                                    ? "bg-money-in/10 text-money-in"
                                    : "bg-money-out/10 text-money-out"
                                }`}
                              >
                                {tx.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold">
                              {tx.symbol}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums">
                              {tx.quantity}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums">
                              {money(tx.price)}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold tabular-nums">
                              {money(tx.quantity * tx.price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === "charts" && (
            <section>
              <h2 className="font-semibold">Market price charts</h2>
              <p className="mt-0.5 text-sm text-slate-400">
                Historical prices for gold, silver and other commodities
              </p>
              <div className="charts-grid">{renderCharts()}</div>
            </section>
          )}

          {showTradeForm && (
            <TradeForm
              type={tradeFormType}
              stock={selectedStockForTrade}
              onSuccess={handleTradeSuccess}
              onCancel={() => setShowTradeForm(false)}
            />
          )}
        </>
      )}
    </main>
  );
}

export default PriceTracking;
