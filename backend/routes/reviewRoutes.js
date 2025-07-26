const express = require("express");
const router = express.Router();
const { submitReview, getReviewsWithSummary } = require("../controllers/reviewController");

router.post("/", submitReview);
router.get("/:city", getReviewsWithSummary);

module.exports = router;
