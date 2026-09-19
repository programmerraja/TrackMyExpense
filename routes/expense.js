const express = require("express");
const router = express.Router();
const ExpenseController = require("../controllers/expense");
const BankMappingController = require("../controllers/bankMapping");

router
  .route("/")
  .get(ExpenseController.getExpense)
  .post(ExpenseController.addExpense);

router.route("/recurring").post(ExpenseController.processRecurring);

router.route("/search").get(ExpenseController.searchExpense);

router.route("/people").get(ExpenseController.getPeople);

router
  .route("/bank-mappings")
  .get(BankMappingController.list)
  .put(BankMappingController.upsert);

router.route("/bank-mappings/:id").delete(BankMappingController.remove);

router.route("/:id").post(ExpenseController.editExpense);

router.route("/:id").delete(ExpenseController.deleteExpense);

module.exports = router;
