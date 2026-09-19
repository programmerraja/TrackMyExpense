const mongoose = require("mongoose");

const BankMappingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    matchText: {
      type: String,
      required: true,
      trim: true,
    },
    direction: {
      type: String,
      enum: ["debit", "credit"],
      required: true,
    },
    type: {
      type: String,
      enum: [
        "EXPENSE",
        "INCOME",
        "INCOME_TAX",
        "DEBT_GIVEN",
        "DEBT_BOUGHT",
        "SKIP",
      ],
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: "other",
    },
    granularity: {
      type: String,
      enum: ["month", "payee", "transaction"],
      default: "month",
    },
  },
  { timestamps: true },
);

BankMappingSchema.index(
  { userId: 1, matchText: 1, direction: 1 },
  { unique: true },
);

module.exports =
  mongoose.models.BankMapping ||
  mongoose.model("BankMapping", BankMappingSchema);
