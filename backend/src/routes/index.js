import { Router } from "express";
import { healthCheck } from "../controllers/health.controller.js";
import reviewsRoutes from "./reviews.routes.js";
import distanceRoutes from "./distance.routes.js";
import youtubeRoutes from "./youtube.routes.js";
import itineraryRoutes from "./itinerary.routes.js";
import attractionsRoutes from "./attractions.routes.js";

const router = Router();

router.get("/health", healthCheck);
router.use("/attractions", attractionsRoutes);
router.use("/reviews", reviewsRoutes);
router.use("/distance", distanceRoutes);
router.use("/youtube", youtubeRoutes);
router.use("/itinerary", itineraryRoutes);

// 🔴 Remove any temporary seed endpoints you may have added earlier.

export default router;
