// models/City.js
const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: String,
  description: String,
  imageUrl: String
});

const citySchema = new mongoose.Schema({
  name: String,
  description: String,
  images: [String],
  places: [placeSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const City = mongoose.model('City', citySchema);

module.exports = City;
