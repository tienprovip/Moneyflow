import { Router } from "express";
import authRoutes from "../modules/auth/auth.route";
import accountRoutes from "../modules/account/account.route";
import transactionRoutes from "../modules/transaction/transaction.route";
import categoryRoutes from "../modules/category/category.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/account", accountRoutes);
router.use("/transaction", transactionRoutes);
router.use("/category", categoryRoutes);
export default router;
