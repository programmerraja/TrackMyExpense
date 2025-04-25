const express = require("express");
const router = express.Router();
const priceTrackingController = require("../controllers/priceTracking");

// Get price tracking data
router.route("/track").get(priceTrackingController.getPriceTracking);

router.route("/stocks")
  .get(priceTrackingController.getUserStocks)
  .post(priceTrackingController.addUserStock);

router.route("/stocks/:symbol")
  .delete(priceTrackingController.removeUserStock);

module.exports = router;
