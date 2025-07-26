const mongoose = require("mongoose");

const sentimentSummarySchema = new mongoose.Schema({
  city: { type: String, unique: true },
  pros: [String],
  cons: [String],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SentimentSummary", sentimentSummarySchema);
