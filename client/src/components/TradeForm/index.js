import React, { useState } from "react";
import API from "../../utils/API";
import { useToast } from "../Toast";
import "./style.css";

const TradeForm = ({ type, stock, onSuccess, onCancel }) => {
  const [symbol, setSymbol] = useState(stock?.symbol || "");
  const [name, setName] = useState(stock?.name || "");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState(stock?.price || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!symbol || !name || !quantity || !price) {
      addToast("Please fill in all required fields", "error");
      return;
    }

    if (
      type === "SELL" &&
      stock?.holding &&
      quantity > stock.holding.quantity
    ) {
      addToast(
        `You only own ${stock.holding.quantity} shares of ${symbol}`,
        "error",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await API.addTransaction({
        symbol,
        name,
        type,
        quantity: Number(quantity),
        price: Number(price),
        date,
        note,
      });

      addToast(`${type} transaction recorded successfully!`, "success");
      onSuccess();
    } catch (error) {
      console.error("Error recording transaction:", error);
      addToast(
        error.response?.data?.error || "Failed to record transaction",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="trade-modal-overlay">
      <div className="trade-modal">
        <div className="trade-modal-header">
          <h2>{type === "BUY" ? "Buy Stock" : "Sell Stock"}</h2>
          <button className="close-btn" onClick={onCancel}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="trade-form-grid">
            <div className="form-group">
              <label>Symbol</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g. AAPL"
                disabled={!!stock}
                required
              />
            </div>

            <div className="form-group">
              <label>Stock Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apple Inc."
                disabled={!!stock}
                required
              />
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0.01"
                step="any"
                required
              />
            </div>

            <div className="form-group">
              <label>Price per Share</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0.01"
                step="any"
                required
              />
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Note (Optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Why did you make this trade?"
              />
            </div>
          </div>

          <div className="trade-modal-footer">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn-primary ${type === "BUY" ? "btn-buy" : "btn-sell"}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Recording..." : `Confirm ${type}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeForm;
