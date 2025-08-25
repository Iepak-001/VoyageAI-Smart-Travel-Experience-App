import { Router } from "express";
import { createReview, listReviews, getAttractionSentiment } from "../controllers/reviews.controller.js";

const router = Router();

// Reviews
router.post("/", createReview);
router.get("/", listReviews);

// Sentiment summary for a specific attraction
router.get("/attraction/:id/sentiment", getAttractionSentiment);

export default router;
