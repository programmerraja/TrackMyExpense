const mongoose = require("mongoose");
const { String, Number, ObjectId } = mongoose.Schema.Types;

const ExpenseSchema = new mongoose.Schema({
  type: {
    // income,expense,debt_bought,debt_given,investment,tax_paid
    type: String,
    required: true,
  },
  name: {
    type: String,
    trim: true,
  },
  note: {
    type: String,
    trim: true,
  },
  bankNarration: {
    type: String,
    trim: true,
  },
  bankReference: {
    type: String,
    trim: true,
  },
  importFingerprint: {
    type: String,
  },
  amount: {
    type: Number,
    required: [true, "Please add a positive or negative number"],
  },
  userId: {
    type: String,
  },
  workspaceId: {
    type: String,
  },
  category: {
    type: String,
    required: [true, "Please add a category"],
  },
  eventDate: {
    type: Date,
    default: Date.now,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringFrequency: {
    type: String,
    enum: ["weekly", "monthly", "yearly"],
    default: "monthly",
  },
  vault: {
    type: String,
    enum: ["primary", "emergency", "debt"],
    default: "primary",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ExpenseSchema.index(
  { userId: 1, importFingerprint: 1 },
  { unique: true, sparse: true },
);

const Expense = mongoose.model("expense", ExpenseSchema);

module.exports = Expense;
