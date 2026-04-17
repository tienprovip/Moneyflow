import { Router } from "express";
import authRoutes from "../modules/auth/auth.route";
import accountRoutes from "../modules/account/account.route";
import transactionRoutes from "../modules/transaction/transaction.route";
import categoryRoutes from "../modules/category/category.route";
import goldRoutes from "../modules/gold/gold.route";
import stockRoutes from "../modules/stock/stock.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/account", accountRoutes);
router.use("/transaction", transactionRoutes);
router.use("/category", categoryRoutes);
router.use("/gold", goldRoutes);
router.use("/stock", stockRoutes);
export default router;
