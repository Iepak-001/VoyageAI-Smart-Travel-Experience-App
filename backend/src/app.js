import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import routes from "./routes/index.js";

const app = express();

// Middleware
app.use(helmet());
app.use(hpp());
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

// Routes
app.use("/api", routes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

export default app;
