import React from "react";

const TrashIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
  >
    <path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6" />
  </svg>
);

const money = (value) =>
  typeof value === "number" ? value.toFixed(2) : value || "0.00";

const StockCard = ({ stock, onRemove, onTrade }) => {
  const { symbol, name, price, change, changePercent, holding } = stock;

  const isPositive = change >= 0;
  const changeClass = isPositive ? "text-money-in" : "text-money-out";

  const hasHolding = holding && holding.quantity > 0;
  const holdingPnL = hasHolding
    ? (price - holding.avgPrice) * holding.quantity
    : 0;
  const holdingPnLPercent = hasHolding
    ? ((price - holding.avgPrice) / holding.avgPrice) * 100
    : 0;

  return (
    <div className="card flex flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold tracking-tight">{symbol}</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">{name}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-bold tabular-nums">₹{money(price)}</p>
          <p className={`mt-0.5 text-xs font-semibold ${changeClass}`}>
            {isPositive ? "+" : ""}
            {money(change)} ({isPositive ? "+" : ""}
            {money(changePercent)}%)
          </p>
        </div>
      </div>

      {hasHolding && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-white/[0.04] px-3 py-2 text-xs">
          <span className="text-slate-400">
            Owned <b className="text-slate-100">{holding.quantity}</b> @ ₹
            {money(holding.avgPrice)}
          </span>
          <span
            className={`shrink-0 font-semibold ${holdingPnL >= 0 ? "text-money-in" : "text-money-out"}`}
          >
            {holdingPnL >= 0 ? "+" : ""}
            {money(holdingPnL)} ({money(holdingPnLPercent)}%)
          </span>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button className="btn-ghost flex-1" onClick={() => onTrade("BUY")}>
          Buy
        </button>
        <button className="btn-danger flex-1" onClick={() => onTrade("SELL")}>
          Sell
        </button>
        <button
          className="btn-icon hover:bg-money-out/10 hover:text-money-out"
          onClick={() => onRemove(symbol)}
          title="Remove from watchlist"
          aria-label={`Remove ${symbol}`}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};

export default StockCard;
