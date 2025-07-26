const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  city: String,
  rating: Number,
  text: String,
  name: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", reviewSchema);
