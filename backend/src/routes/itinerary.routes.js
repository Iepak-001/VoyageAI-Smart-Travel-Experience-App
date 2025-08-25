import { Router } from "express";
import { createItinerary } from "../controllers/itinerary.controller.js";
import { optimizeItinerary } from "../controllers/optimize.controller.js";

const router = Router();

router.post("/generate", createItinerary);
router.post("/optimize", optimizeItinerary);

export default router;
