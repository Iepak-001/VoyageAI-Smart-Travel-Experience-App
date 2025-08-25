import { Router } from "express";
import { youtubeSearch } from "../controllers/youtube.controller.js";

const router = Router();

// GET /api/youtube/search?q=paris travel
router.get("/search", youtubeSearch);

export default router;
