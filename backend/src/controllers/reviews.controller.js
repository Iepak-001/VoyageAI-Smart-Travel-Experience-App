import { Review } from "../models/Review.js";
import { Attraction } from "../models/Attraction.js";
import { analyzeSentiment, summarizeSentiments } from "../services/sentiment.js";

const RECOMPUTE_THRESHOLD = 5;

export const createReview = async (req, res) => {
  try {
    const { attractionId, author, rating, text } = req.body;

    if (!attractionId || !rating || !text) {
      return res.status(400).json({ success: false, message: "attractionId, rating, text are required" });
    }

    const attraction = await Attraction.findById(attractionId);
    if (!attraction) return res.status(404).json({ success: false, message: "Attraction not found" });

    // Sentiment for this review
    const sentiment = await analyzeSentiment(text);

    const review = await Review.create({
      attraction: attraction._id,
      author: author || "Anonymous",
      rating,
      text,
      sentiment
    });

    // Increment pending counter and decide whether to recompute
    attraction.pendingSentimentCount = (attraction.pendingSentimentCount || 0) + 1;

    if (attraction.pendingSentimentCount >= RECOMPUTE_THRESHOLD) {
      const reviews = await Review.find({ attraction: attraction._id }, { sentiment: 1 }).lean();
      const summary = summarizeSentiments(reviews);
      attraction.sentimentSummary = summary;
      attraction.pendingSentimentCount = 0; // reset after recompute
    }

    await attraction.save();

    return res.status(201).json({ success: true, message: "Review added", data: { review } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to create review" });
  }
};

export const listReviews = async (req, res) => {
  try {
    const { attractionId, limit = 20, page = 1 } = req.query;
    const q = attractionId ? { attraction: attractionId } : {};
    const reviews = await Review.find(q)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    return res.json({ success: true, data: { reviews } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to list reviews" });
  }
};

export const getAttractionSentiment = async (req, res) => {
  try {
    const { id } = req.params;
    const attraction = await Attraction.findById(id).lean();
    if (!attraction) return res.status(404).json({ success: false, message: "Attraction not found" });
    return res.json({
      success: true,
      data: {
        attractionId: id,
        sentimentSummary: attraction.sentimentSummary || null,
        pendingSentimentCount: attraction.pendingSentimentCount || 0
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to fetch sentiment summary" });
  }
};
