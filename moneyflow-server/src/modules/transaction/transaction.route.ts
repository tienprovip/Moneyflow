import { Router } from "express";
import * as controller from "./transaction.controller";
import { protect } from "../../middlewares/auth.middleware";

const router = Router();

router.use(protect);

router.post("/", controller.createTransaction);
router.get("/", controller.getTransactions);
router.get("/summary", controller.getSummary);
router.put("/:id", controller.updateTransaction);
router.delete("/:id", controller.deleteTransaction);

export default router;
