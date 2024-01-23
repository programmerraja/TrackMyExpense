const mongoose = require("mongoose");
const { String, Number, ObjectId } = mongoose.Schema.Types;

const ExpenseSchema = new mongoose.Schema({
  type: {
    // income,expense,debt_bought,debt_given,investment
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
  amount: {
    type: Number,
    required: [true, "Please add a positive or negative number"],
  },
  userId: {
    type: String,
    ref: "User",
  },
  category: {
    type: String,
    required: [true, "Please add a category"],
  },
  eventDate: {
    type: Date,
    default: Date.now,
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

const Expense = mongoose.model("expense", ExpenseSchema);

module.exports = Expense;
