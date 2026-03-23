import { Router, type IRouter } from "express";
import { findAlternativeSlots } from "../lib/suggestionEngine.js";

const router: IRouter = Router();

router.post("/", async (req, res) => {
  const { capacity, requiresI7, requiresGraphics, bookingId, preferredWeek } = req.body;
  if (!capacity) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "capacity is required" });
  }
  const suggestions = await findAlternativeSlots({
    capacity,
    requiresI7: requiresI7 ?? false,
    requiresGraphics: requiresGraphics ?? false,
  });
  return res.json(suggestions);
});

export default router;
