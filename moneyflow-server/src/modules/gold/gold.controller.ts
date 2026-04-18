import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { t, buildValidationError } from "../../i18n";
import * as goldService from "./gold.service";
import { GoldType } from "./gold.model";
import { z } from "zod";

const createGoldSchema = z.object({
  goldType: z.nativeEnum(GoldType).optional(),
  weight: z.number().positive(),
  buyPrice: z.number().positive(),
  buyDate: z.string().optional(),
  currencyCode: z.string().optional(),
  sourceAccountId: z.string().optional(),
  note: z.string().trim().optional(),
});

// Mua thêm vào vị thế đã có
const buyMoreGoldSchema = z.object({
  weight: z.number().positive(),
  buyPrice: z.number().positive(),
  buyDate: z.string().optional(),
  accountId: z.string().optional(),
});

// Bán
const sellGoldSchema = z.object({
  weight: z.number().positive(),
  sellPrice: z.number().positive(),
  sellAccountId: z.string(),
  sellDate: z.string().optional(),
});

// ─── GET LIST ────────────────────────────────────────────────────────────────
export const getGolds = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: t(req, "auth.notAuthorized") });

    const data = await goldService.getGoldService(userId, req.query);
    return res.json(data);
  } catch (error) {
    console.error("GET GOLD ERROR:", error);
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};

// ─── GET BY ID ───────────────────────────────────────────────────────────────
export const getGoldById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: t(req, "auth.notAuthorized") });

    const data = await goldService.getGoldByIdService(userId, String(req.params.id));
    if (!data) return res.status(404).json({ message: t(req, "gold.notFound") });
    return res.json(data);
  } catch (error) {
    console.error("GET GOLD BY ID ERROR:", error);
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};

// ─── CREATE (vị thế mới) ─────────────────────────────────────────────────────
export const createGold = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: t(req, "auth.notAuthorized") });

    const parsed = createGoldSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(buildValidationError(req, parsed.error));

    const data = await goldService.createGoldService(userId, parsed.data);
    return res.status(201).json(data);
  } catch (error: any) {
    if (error.message === "GOLD_POSITION_ALREADY_EXISTS") {
      return res.status(400).json({ message: t(req, "gold.positionAlreadyExists") });
    }
    if (error.message === "SOURCE_ACCOUNT_NOT_FOUND") {
      return res.status(404).json({ message: t(req, "account.notFound") });
    }
    if (error.message === "INSUFFICIENT_SOURCE_BALANCE") {
      return res.status(400).json({ message: t(req, "account.insufficientSourceBalance") });
    }
    console.error("CREATE GOLD ERROR:", error);
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};

// ─── BUY MORE (mua thêm vào vị thế) ─────────────────────────────────────────
export const buyMoreGold = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: t(req, "auth.notAuthorized") });

    const parsed = buyMoreGoldSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(buildValidationError(req, parsed.error));

    const data = await goldService.buyMoreGoldService(userId, String(req.params.id), parsed.data);
    return res.json(data);
  } catch (error: any) {
    if (error.message === "GOLD_NOT_FOUND") {
      return res.status(404).json({ message: t(req, "gold.notFound") });
    }
    if (error.message === "GOLD_ALREADY_SOLD") {
      return res.status(400).json({ message: t(req, "gold.alreadySold") });
    }
    if (error.message === "SOURCE_ACCOUNT_NOT_FOUND") {
      return res.status(404).json({ message: t(req, "account.notFound") });
    }
    if (error.message === "INSUFFICIENT_SOURCE_BALANCE") {
      return res.status(400).json({ message: t(req, "account.insufficientSourceBalance") });
    }
    console.error("BUY MORE GOLD ERROR:", error);
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};

// ─── SELL ────────────────────────────────────────────────────────────────────
export const sellGold = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: t(req, "auth.notAuthorized") });

    const parsed = sellGoldSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(buildValidationError(req, parsed.error));

    const data = await goldService.sellGoldService(userId, String(req.params.id), parsed.data);
    return res.json(data);
  } catch (error: any) {
    if (error.message === "GOLD_NOT_FOUND") {
      return res.status(404).json({ message: t(req, "gold.notFound") });
    }
    if (error.message === "GOLD_ALREADY_SOLD") {
      return res.status(400).json({ message: t(req, "gold.alreadySold") });
    }
    if (error.message === "INSUFFICIENT_GOLD_WEIGHT") {
      return res.status(400).json({ message: t(req, "gold.insufficientWeight") });
    }
    if (error.message === "INVALID_SELL_WEIGHT") {
      return res.status(400).json({ message: t(req, "gold.invalidSellWeight") });
    }
    if (error.message === "SELL_ACCOUNT_NOT_FOUND") {
      return res.status(404).json({ message: t(req, "account.notFound") });
    }
    console.error("SELL GOLD ERROR:", error);
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};

// ─── DELETE ──────────────────────────────────────────────────────────────────
export const deleteGold = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: t(req, "auth.notAuthorized") });

    await goldService.deleteGoldService(userId, String(req.params.id));
    return res.json({ message: t(req, "gold.deletedSuccess") });
  } catch (error: any) {
    if (error.message === "GOLD_NOT_FOUND") {
      return res.status(404).json({ message: t(req, "gold.notFound") });
    }
    if (error.message === "GOLD_ALREADY_SOLD" || error.message === "GOLD_PARTIALLY_SOLD") {
      return res.status(400).json({ message: t(req, "gold.cannotDelete") });
    }
    console.error("DELETE GOLD ERROR:", error);
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};
