import { Router } from "express";
import * as controller from "./stock.controller";
import { protect } from "../../middlewares/auth.middleware";

const router = Router();

router.use(protect);

router.get("/", controller.getStocks);
router.get("/:id", controller.getStockById);
router.post("/", controller.createStock);
router.post("/buy/:id", controller.buyMoreStock);   // Mua thêm vào vị thế (cập nhật giá bình quân)
router.post("/sell/:id", controller.sellStock);
router.delete("/:id", controller.deleteStock);

export default router;
