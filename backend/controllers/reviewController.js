const Review = require("../models/Review");
const SentimentSummary = require("../models/SentimentSummary");
const { extractProsConsFromReviews } = require("../bertProsCons");

async function updateSentimentSummary(city) {
  const reviews = await Review.find({ city });
  const texts = reviews.map((r) => r.text);

  const summary = await extractProsConsFromReviews(texts);

  await SentimentSummary.findOneAndUpdate(
    { city },
    { pros: summary.pros, cons: summary.cons, updatedAt: new Date() },
    { upsert: true }
  );
}

const submitReview = async (req, res) => {
  try {
    const { city, text, rating, name } = req.body;
    if (!city || !text || !rating) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newReview = new Review({ city, text, rating, name });
    await newReview.save();

    const totalReviews = await Review.countDocuments({ city });

    // Update summary every 5 new reviews asynchronously
    if (totalReviews % 5 === 0) {
      updateSentimentSummary(city).catch(console.error);
    }

    res.status(201).json({ message: "Review submitted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit review", detail: err.message });
  }
};

const getReviewsWithSummary = async (req, res) => {
  try {
    const { city } = req.params;
    const reviews = await Review.find({ city }).sort({ createdAt: -1 });
    const summary = await SentimentSummary.findOne({ city });

    res.json({ reviews, summary: summary || { pros: [], cons: [] } });
  } catch (err) {
    res.status(500).json({ error: "Failed to get reviews" });
  }
};

module.exports = { submitReview, getReviewsWithSummary };
