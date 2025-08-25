import { generateItinerary } from "../services/gemini.js";

export const createItinerary = async (req, res) => {
  try {
    const { attractions = [], days = 3, region = "" } = req.body;
    const plan = await generateItinerary(attractions, days, region);
    return res.json({ success: true, data: plan });
  } catch (err) {
    console.error("Gemini itinerary error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to generate itinerary" });
  }
};
