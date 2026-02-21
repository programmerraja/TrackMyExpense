const mongoose = require("mongoose");
const { String, Number, ObjectId } = mongoose.Schema.Types;

const StockTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
    },
  },
  { timestamps: true },
);

const StockTransaction =
  mongoose.models.StockTransaction ||
  mongoose.model("StockTransaction", StockTransactionSchema);

module.exports = StockTransaction;
