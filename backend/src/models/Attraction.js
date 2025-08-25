import mongoose from "mongoose";

const sentimentSummarySchema = new mongoose.Schema(
  {
    positive: { type: Number, default: 0 },
    negative: { type: Number, default: 0 },
    neutral: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    updatedAt: { type: Date, default: null }
  },
  { _id: false }
);

const attractionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    pendingSentimentCount: { type: Number, default: 0 },
    sentimentSummary: { type: sentimentSummarySchema, default: () => ({}) }
  },
  { timestamps: true }
);

// 🔎 basic text search on name + location
attractionSchema.index({ name: "text", location: "text" });

export const Attraction = mongoose.model("Attraction", attractionSchema);
