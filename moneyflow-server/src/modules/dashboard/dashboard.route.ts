import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { getDashboardSummary } from "./dashboard.controller";

const router = Router();

router.use(protect);

router.get("/summary", getDashboardSummary);

export default router;
