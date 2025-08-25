import "dotenv/config";
import { PORT } from "./constants.js";
import { connectDB } from "./db/connect.js";
import app from "./app.js";

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 VoyageAI backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server failed:", err.message);
    process.exit(1);
  }
};

start();
