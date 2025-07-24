const express = require('express');
const router = express.Router();
const {
  generateItinerary,
  analyzeSentiment,
  getRecommendations,
  getTravelVideos
} = require('../controllers/aiController');

router.post('/itinerary', generateItinerary);
router.post('/sentiment', analyzeSentiment);
router.post('/recommend', getRecommendations);
router.get('/videos', getTravelVideos);

module.exports = router;
