const Expense = require("./expense.js");
const { EXPENSE_TYPE } = require("../controllers/expense.js");
const mongoose = require("mongoose");
const { Mongoose } = require("mongoose");

module.exports = { Expense };

// DEBT_BOUGHT store as postive 
// DEBT_GIVEN store as negative

function seedData() {
  const data = [
    {
      type: EXPENSE_TYPE.INCOME,
      name: "salary",
      note: "",
      amount: 500,
      userId: "123",
      category: "salary",
    },
    {
      type: EXPENSE_TYPE.EXPENSE,
      name: "food",
      note: "",
      amount: -100,
      userId: "123",
      category: "food",
    },
    {
      type: EXPENSE_TYPE.EXPENSE,
      name: "travel",
      note: "",
      amount: -50,
      userId: "123",
      category: "travel",
    },
    {
      type: EXPENSE_TYPE.DEBT_GIVEN,
      name: "selvam",
      note: "",
      amount: -300,
      userId: "123",
      category: "DEBT_GIVEN",
    },
  ];

  data.map((obj) => {
    Expense.create(obj);
  });
}

// setTimeout(() => seedData(), 3000);
