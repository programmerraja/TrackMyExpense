const express = require("express");
const router = express.Router();
const ExpenseController = require("../controllers/expense");

router
  .route("/")
  .get(ExpenseController.getExpense)
  .post(ExpenseController.addExpense);

router.route("/:id").post(ExpenseController.editExpense);

router.route("/:id").delete(ExpenseController.deleteExpense);

module.exports = router;
