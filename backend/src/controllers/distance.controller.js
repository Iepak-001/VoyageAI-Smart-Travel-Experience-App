import { getDistanceMatrix } from "../services/googleDistance.js";

export const calculateDistance = async (req, res) => {
  try {
    const { origins, destinations } = req.body;

    if (!origins?.length || !destinations?.length) {
      return res.status(400).json({
        success: false,
        message: "origins[] and destinations[] are required",
      });
    }

    const result = await getDistanceMatrix(origins, destinations);

    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
