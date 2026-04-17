import { Router } from "express";
import * as controller from "./gold.controller";
import { protect } from "../../middlewares/auth.middleware";

const router = Router();

router.use(protect);

router.get("/", controller.getGolds);
router.get("/:id", controller.getGoldById);
router.post("/", controller.createGold);
router.post("/buy/:id", controller.buyMoreGold);    // Mua thêm vào vị thế (cập nhật giá bình quân)
router.post("/sell/:id", controller.sellGold);
router.delete("/:id", controller.deleteGold);

export default router;
