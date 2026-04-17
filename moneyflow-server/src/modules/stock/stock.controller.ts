import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { t, buildValidationError } from "../../i18n";
import * as stockService from "./stock.service";
import { z } from "zod";

const createStockSchema = z.object({
  symbol: z.string().min(1).toUpperCase(),
  quantity: z.number().positive(),
  buyPrice: z.number().positive(),
  buyDate: z.string().optional(),
  currencyCode: z.string().optional(),
  sourceAccountId: z.string().optional(),
});

// Mua thêm vào vị thế đã có
const buyMoreStockSchema = z.object({
  quantity: z.number().positive(),
  buyPrice: z.number().positive(),
  buyDate: z.string().optional(),
  accountId: z.string().optional(),
});

// Bán — bắt buộc có quantity
const sellStockSchema = z.object({
  quantity: z.number().positive(),
  sellPrice: z.number().positive(),
  sellAccountId: z.string(),
  sellDate: z.string().optional(),
});

// ─── GET LIST ────────────────────────────────────────────────────────────────
export const getStocks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: t(req, "auth.notAuthorized") });

    const data = await stockService.getStockService(userId, req.query);
    return res.json(data);
  } catch (error) {
    console.error("GET STOCK ERROR:", error);
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};

// ─── GET BY ID ───────────────────────────────────────────────────────────────
export const getStockById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: t(req, "auth.notAuthorized") });

    const data = await stockService.getStockByIdService(userId, String(req.params.id));
    if (!data) return res.status(404).json({ message: t(req, "stock.notFound") });
    return res.json(data);
  } catch (error) {
    console.error("GET STOCK BY ID ERROR:", error);
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};

// ─── CREATE (vị thế mới) ─────────────────────────────────────────────────────
export const createStock = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: t(req, "auth.notAuthorized") });

    const parsed = createStockSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(buildValidationError(req, parsed.error));

    const data = await stockService.createStockService(userId, parsed.data);
    return res.status(201).json(data);
  } catch (error: any) {
    if (error.message === "SOURCE_ACCOUNT_NOT_FOUND") {
      return res.status(404).json({ message: t(req, "account.notFound") });
    }
    if (error.message === "INSUFFICIENT_SOURCE_BALANCE") {
      return res.status(400).json({ message: t(req, "account.insufficientSourceBalance") });
    }
    console.error("CREATE STOCK ERROR:", error);
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};

// ─── BUY MORE (mua thêm vào vị thế) ─────────────────────────────────────────
export const buyMoreStock = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: t(req, "auth.notAuthorized") });

    const parsed = buyMoreStockSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(buildValidationError(req, parsed.error));

    const data = await stockService.buyMoreStockService(userId, String(req.params.id), parsed.data);
    return res.json(data);
  } catch (error: any) {
    if (error.message === "STOCK_NOT_FOUND") {
      return res.status(404).json({ message: t(req, "stock.notFound") });
    }
    if (error.message === "STOCK_ALREADY_SOLD") {
      return res.status(400).json({ message: t(req, "stock.alreadySold") });
    }
    if (error.message === "SOURCE_ACCOUNT_NOT_FOUND") {
      return res.status(404).json({ message: t(req, "account.notFound") });
    }
    if (error.message === "INSUFFICIENT_SOURCE_BALANCE") {
      return res.status(400).json({ message: t(req, "account.insufficientSourceBalance") });
    }
    console.error("BUY MORE STOCK ERROR:", error);
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};

// ─── SELL ────────────────────────────────────────────────────────────────────
export const sellStock = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: t(req, "auth.notAuthorized") });

    const parsed = sellStockSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(buildValidationError(req, parsed.error));

    const data = await stockService.sellStockService(userId, String(req.params.id), parsed.data);
    return res.json(data);
  } catch (error: any) {
    if (error.message === "STOCK_NOT_FOUND") {
      return res.status(404).json({ message: t(req, "stock.notFound") });
    }
    if (error.message === "STOCK_ALREADY_SOLD") {
      return res.status(400).json({ message: t(req, "stock.alreadySold") });
    }
    if (error.message === "INSUFFICIENT_STOCK_QUANTITY") {
      return res.status(400).json({ message: t(req, "stock.insufficientQuantity") });
    }
    if (error.message === "INVALID_SELL_QUANTITY") {
      return res.status(400).json({ message: t(req, "stock.invalidSellQuantity") });
    }
    if (error.message === "SELL_ACCOUNT_NOT_FOUND") {
      return res.status(404).json({ message: t(req, "account.notFound") });
    }
    console.error("SELL STOCK ERROR:", error);
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};

// ─── DELETE ──────────────────────────────────────────────────────────────────
export const deleteStock = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: t(req, "auth.notAuthorized") });

    await stockService.deleteStockService(userId, String(req.params.id));
    return res.json({ message: t(req, "stock.deletedSuccess") });
  } catch (error: any) {
    if (error.message === "STOCK_NOT_FOUND") {
      return res.status(404).json({ message: t(req, "stock.notFound") });
    }
    if (error.message === "STOCK_ALREADY_SOLD" || error.message === "STOCK_PARTIALLY_SOLD") {
      return res.status(400).json({ message: t(req, "stock.cannotDelete") });
    }
    console.error("DELETE STOCK ERROR:", error);
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};
