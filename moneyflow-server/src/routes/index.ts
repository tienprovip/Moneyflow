import { Router } from "express";
import authRoutes from "../modules/auth/auth.route";
import accountRoutes from "../modules/account/account.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/account", accountRoutes);
export default router;
