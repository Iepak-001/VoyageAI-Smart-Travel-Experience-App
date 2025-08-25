import { optimizeRoute } from "../services/routeOptimizer.js";

export const optimizeItinerary = async (req, res) => {
  try {
    const { places } = req.body;

    if (!places || !Array.isArray(places) || places.length < 2) {
      return res.status(400).json({ success: false, message: "places[] with 2+ entries required" });
    }

    const result = await optimizeRoute(places);

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("Route optimization error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to optimize route" });
  }
};
