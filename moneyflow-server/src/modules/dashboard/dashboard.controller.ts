import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { getDashboardSummaryService } from "./dashboard.service";

export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const summary = await getDashboardSummaryService(userId);
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};
