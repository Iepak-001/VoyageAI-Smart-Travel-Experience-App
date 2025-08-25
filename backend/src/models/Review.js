import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    attraction: { type: mongoose.Schema.Types.ObjectId, ref: "Attraction", required: true },
    author: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    text: { type: String, required: true, trim: true },
    sentiment: {
      label: { type: String, enum: ["POSITIVE", "NEGATIVE"], default: null },
      score: { type: Number, default: null } // confidence 0..1
    }
  },
  { timestamps: true }
);

export const Review = mongoose.model("Review", reviewSchema);
