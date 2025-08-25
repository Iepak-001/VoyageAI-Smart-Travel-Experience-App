import { Router } from "express";
import {
  createAttraction,
  listAttractions,
  getAttraction,
  updateAttraction,
  deleteAttraction,
} from "../controllers/attractions.controller.js";

const router = Router();

router.post("/", createAttraction);
router.get("/", listAttractions);
router.get("/:id", getAttraction);
router.patch("/:id", updateAttraction);
router.delete("/:id", deleteAttraction);

export default router;
