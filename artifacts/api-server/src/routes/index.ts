import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import labsRouter from "./labs.js";
import bookingsRouter from "./bookings.js";
import conflictsRouter from "./conflicts.js";
import suggestionsRouter from "./suggestions.js";
import analyticsRouter from "./analytics.js";
import auditRouter from "./audit.js";
import alertsRouter from "./alerts.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/labs", labsRouter);
router.use("/bookings", bookingsRouter);
router.use("/conflicts", conflictsRouter);
router.use("/suggestions", suggestionsRouter);
router.use("/analytics", analyticsRouter);
router.use("/dashboard", analyticsRouter);
router.use("/audit", auditRouter);
router.use("/alerts", alertsRouter);

export default router;
