const express = require("express");
const router = express.Router();
const { signin, updateSettings } = require("../controllers/user");
const auth = require("../middleware/auth");

router.route("/").post(signin);

router.route("/settings").put(auth.isAuthenticated(), updateSettings);

module.exports = router;
