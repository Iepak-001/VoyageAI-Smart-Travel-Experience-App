import { Router } from "express";
import { calculateDistance } from "../controllers/distance.controller.js";

const router = Router();

router.post("/", calculateDistance);

export default router;
