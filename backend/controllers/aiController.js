const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Gemini model (text-only)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// POST /api/itinerary
exports.generateItinerary = async (req, res) => {
  console.log('====================================');
  console.log("Generating itinerary with request body:", req.body);
  console.log('====================================');
  const { city, days, travelStyle } = req.body;
  try {
    const prompt = `Create a ${days}-day solo travel itinerary for ${city} focusing on ${travelStyle} style. Include day-wise plan, timings, and travel tips.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log('===================================='  );
    console.log(response.text());
    console.log('====================================');
    
    const text = response.text();

    res.json({ itinerary: text });
  } catch (error) {
    console.error("Itinerary generation failed:", error.message);
    res.status(500).json({ error: "Failed to generate itinerary" });
  }
};

// POST /api/sentiment
exports.analyzeSentiment = async (req, res) => {
  const { reviews } = req.body;
  try {
    const prompt = `Summarize the following travel reviews and extract key pros and cons:\n\n${reviews.join("\n\n")}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ summary: text });
  } catch (error) {
    console.error("Sentiment analysis failed:", error.message);
    res.status(500).json({ error: "Sentiment analysis failed" });
  }
};

// POST /api/recommend
exports.getRecommendations = async (req, res) => {
  const { userPrefs } = req.body;

  try {
    const prompt = `Based on the user's travel preferences: ${userPrefs}, recommend 5 solo travel destinations with reasons.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ recommendations: text });
  } catch (error) {
    console.error("Recommendation generation failed:", error.message);
    res.status(500).json({ error: "Recommendation generation failed" });
  }
};

// GET /api/videos?city=Paris
exports.getTravelVideos = async (req, res) => {
  const { city } = req.query;

  if (!city) return res.status(400).json({ error: "City is required" });

  try {
    const query = `${city} solo travel vlog`;
    const url = `https://www.googleapis.com/youtube/v3/search`;
    const params = {
      part: "snippet",
      q: query,
      key: process.env.YOUTUBE_API_KEY,
      type: "video",
      maxResults: 5,
    };

    const response = await axios.get(url, { params });
    const videos = response.data.items.map((item) => ({
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      channel: item.snippet.channelTitle,
      videoId: item.id.videoId,
      videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    res.json({ videos });
  } catch (error) {
    console.error("YouTube fetch failed:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch travel videos" });
  }
};

