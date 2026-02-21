const express = require("express");
const router = express.Router();
const priceTrackingController = require("../controllers/priceTracking");
const stockTransactionController = require("../controllers/stockTransaction");

// Get price tracking data
router.route("/track").get(priceTrackingController.getPriceTracking);

router
  .route("/stocks")
  .get(priceTrackingController.getUserStocks)
  .post(priceTrackingController.addUserStock);

router.route("/stocks/:symbol").delete(priceTrackingController.removeUserStock);

// Portfolio and Transactions
router.route("/portfolio/holdings").get(stockTransactionController.getHoldings);

router
  .route("/portfolio/transactions")
  .get(stockTransactionController.getTransactions)
  .post(stockTransactionController.addTransaction);

module.exports = router;
