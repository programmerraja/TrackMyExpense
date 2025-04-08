const express = require("express");
const router = express.Router();
const priceTrackingController = require("../controllers/priceTracking");

router.route("/track").get(priceTrackingController.getPriceTracking);

module.exports = router;
