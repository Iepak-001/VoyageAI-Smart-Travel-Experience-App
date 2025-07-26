// backend/controllers/destinationController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get YouTube videos
async function fetchYouTubeVideos(city) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const searchQuery = `Top tourist places in ${city}`;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(searchQuery)}&key=${apiKey}`;

  const response = await axios.get(url);
  return response.data.items.map((item) => ({
    title: item.snippet.title,
    videoId: item.id.videoId,
    thumbnail: item.snippet.thumbnails.high.url,
  }));
}

// Generate AI description using Gemini
async function generateGeminiDescription(city) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `Write an engaging 100-150 word travel guide for solo travelers visiting ${city}. Highlight popular attractions, food, safety tips, and why it's worth visiting.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Controller function
const getDestinationDetails = async (req, res) => {
  try {
    const { city } = req.params;

    const [description, videos] = await Promise.all([
      generateGeminiDescription(city),
      fetchYouTubeVideos(city),
    ]);

    res.json({ city, description, videos });
  } catch (error) {
    console.error("Error fetching destination info:", error.message);
    res.status(500).json({ error: "Failed to fetch destination data" });
  }
};

module.exports = { getDestinationDetails };
