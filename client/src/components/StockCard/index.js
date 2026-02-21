import React from "react";

const StockCard = ({ stock, onRemove, onTrade }) => {
  const { symbol, name, price, change, changePercent, holding } = stock;

  // Determine if the stock change is positive or negative
  const isPositive = change > 0;
  const changeClass = isPositive ? "positive" : "negative";
  const changeSign = isPositive ? "+" : "";

  // Format values
  const formattedPrice = typeof price === "number" ? price.toFixed(2) : price;
  const formattedChange =
    typeof change === "number" ? change.toFixed(2) : change;
  const formattedPercent =
    typeof changePercent === "number"
      ? changePercent.toFixed(2)
      : changePercent;

  // Holding info
  const hasHolding = holding && holding.quantity > 0;
  const holdingPnL = hasHolding
    ? (price - holding.avgPrice) * holding.quantity
    : 0;
  const holdingPnLPercent = hasHolding
    ? ((price - holding.avgPrice) / holding.avgPrice) * 100
    : 0;

  return (
    <div className="stock-card">
      <div className="stock-card-header">
        <div className="stock-info">
          <span className="stock-symbol">{symbol}</span>
          <span className="stock-name">{name}</span>
        </div>
        <div className="stock-price-container">
          <span className="stock-price">₹ {formattedPrice}</span>
          <div className={`stock-change ${changeClass}`}>
            {changeSign}
            {formattedChange} ({changeSign}
            {formattedPercent}%)
          </div>
        </div>
      </div>

      {hasHolding && (
        <div className="stock-holding-info">
          <div className="holding-row">
            <span>
              Owned: <b>{holding.quantity}</b> @ ₹{holding.avgPrice.toFixed(2)}
            </span>
            <span className={holdingPnL >= 0 ? "positive" : "negative"}>
              {holdingPnL >= 0 ? "+" : ""}
              {holdingPnL.toFixed(2)} ({holdingPnLPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      )}

      <div className="stock-card-actions">
        <div className="trade-actions">
          <button className="trade-btn buy-btn" onClick={() => onTrade("BUY")}>
            Buy
          </button>
          <button
            className="trade-btn sell-btn"
            onClick={() => onTrade("SELL")}
          >
            Sell
          </button>
        </div>
        <button
          className="stock-remove-btn"
          onClick={() => onRemove(symbol)}
          title="Remove from watchlist"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
            <path
              fillRule="evenodd"
              d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default StockCard;
