import axios from "axios";

export async function getDistanceMatrix(origins, destinations) {
  try {
    const url = "https://maps.googleapis.com/maps/api/distancematrix/json";
    const key = process.env.GOOGLE_DISTANCE_MATRIX_API_KEY;


    console.log("📡 Using Google Key:", key?.slice(0, 10) + "...");

    const params = {
      origins: origins.join("|"),
      destinations: destinations.join("|"),
      key
    };

    const { data } = await axios.get(url, { params });

    console.log("📡 Google API response:", data);

    return data;
  } catch (err) {
    console.error("❌ Distance Matrix error:", err.message);
    throw err;
  }
}
