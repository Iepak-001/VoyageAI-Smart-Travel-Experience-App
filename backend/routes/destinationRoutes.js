// backend/routes/destinationRoutes.js
const express = require("express");
const router = express.Router();
const { getDestinationDetails } = require("../controllers/destinationController");

router.get("/:city", getDestinationDetails);

module.exports = router;
