import mongoose from "mongoose";
import { Attraction } from "../models/Attraction.js";

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createAttraction = async (req, res) => {
  try {
    const { name, location } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "name is required" });
    }
    const doc = await Attraction.create({ name: name.trim(), location: location?.trim() });
    return res.status(201).json({ success: true, data: { attraction: doc } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Failed to create attraction" });
  }
};

export const listAttractions = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));

    let filter = {};
    if (q?.trim()) {
      filter = { $text: { $search: q.trim() } };
    }

    const [items, total] = await Promise.all([
      Attraction.find(filter).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l).lean(),
      Attraction.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: { items, page: p, limit: l, total, pages: Math.ceil(total / l) || 1 },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Failed to list attractions" });
  }
};

export const getAttraction = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ success: false, message: "Invalid id" });
    const doc = await Attraction.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: { attraction: doc } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Failed to fetch attraction" });
  }
};

export const updateAttraction = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ success: false, message: "Invalid id" });

    const update = {};
    if (typeof req.body.name === "string") update.name = req.body.name.trim();
    if (typeof req.body.location === "string") update.location = req.body.location.trim();

    const doc = await Attraction.findByIdAndUpdate(id, update, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });

    return res.json({ success: true, data: { attraction: doc } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Failed to update attraction" });
  }
};

export const deleteAttraction = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ success: false, message: "Invalid id" });

    const doc = await Attraction.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });

    return res.json({ success: true, message: "Attraction deleted" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Failed to delete attraction" });
  }
};
