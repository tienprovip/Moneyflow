import { Router } from "express";
import * as controller from "./account.controller";
import { protect } from "../../middlewares/auth.middleware";

const router = Router();

router.use(protect);

router.post("/create", controller.createAccount);
router.get("/", controller.getAccounts);
router.get("/:id", controller.getAccountById);
router.put("/update/:id", controller.updateAccount);
router.delete("/delete/:id", controller.deleteAccount);
router.post("/settle/:id", controller.settleAccount);

export default router;
