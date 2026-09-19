import React, { useState } from "react";
import API from "../../utils/API";
import { useToast } from "../Toast";

const TradeForm = ({ type, stock, onSuccess, onCancel }) => {
  const [symbol, setSymbol] = useState(stock?.symbol || "");
  const [name, setName] = useState(stock?.name || "");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState(stock?.price || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const isSell = type === "SELL";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!symbol || !name || !quantity || !price) {
      addToast("Please fill in all required fields", "error");
      return;
    }

    if (isSell && stock?.holding && quantity > stock.holding.quantity) {
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
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onCancel}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-ink-900 sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
          <h2 className="font-semibold">
            {isSell ? "Sell stock" : "Buy stock"}
          </h2>
          <button className="btn-icon" onClick={onCancel} aria-label="Close">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="trade-symbol">
                Symbol
              </label>
              <input
                id="trade-symbol"
                type="text"
                className="field"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g. AAPL"
                disabled={!!stock}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="trade-name">
                Stock name
              </label>
              <input
                id="trade-name"
                type="text"
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apple Inc."
                disabled={!!stock}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="trade-qty">
                Quantity
              </label>
              <input
                id="trade-qty"
                type="number"
                className="field"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0.01"
                step="any"
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="trade-price">
                Price per share
              </label>
              <input
                id="trade-price"
                type="number"
                className="field"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0.01"
                step="any"
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="trade-date">
                Date
              </label>
              <input
                id="trade-date"
                type="date"
                className="field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="trade-note">
                Note (optional)
              </label>
              <textarea
                id="trade-note"
                className="field"
                rows="2"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Why did you make this trade?"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2 border-t border-white/5 pt-4">
            <button type="button" className="btn-ghost" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className={isSell ? "btn-danger" : "btn-primary"}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Recording…" : `Confirm ${type}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeForm;
