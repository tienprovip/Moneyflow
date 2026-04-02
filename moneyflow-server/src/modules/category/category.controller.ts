import { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import { buildValidationError, t } from "../../i18n";
import * as categoryService from "./category.service";
import {
  createCategorySchema,
  getCategoriesQuerySchema,
  updateCategorySchema,
} from "./category.validation";

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: t(req, "auth.notAuthorized") });
    }

    const parsed = createCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(buildValidationError(req, parsed.error));
    }

    const category = await categoryService.createCategoryService(
      userId,
      parsed.data,
    );

    return res.status(201).json(category);
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: t(req, "auth.notAuthorized") });
    }

    const parsed = getCategoriesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json(buildValidationError(req, parsed.error));
    }

    const categories = await categoryService.getCategoriesService(
      userId,
      parsed.data,
    );

    return res.json(categories);
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};

export const getCategoryById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: t(req, "auth.notAuthorized") });
    }

    const category = await categoryService.getCategoryByIdService(
      userId,
      String(req.params.id),
    );

    if (!category) {
      return res.status(404).json({ message: t(req, "category.notFound") });
    }

    return res.json(category);
  } catch (error) {
    console.error("GET CATEGORY BY ID ERROR:", error);
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: t(req, "auth.notAuthorized") });
    }

    const parsed = updateCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(buildValidationError(req, parsed.error));
    }

    const category = await categoryService.updateCategoryService(
      userId,
      String(req.params.id),
      parsed.data,
    );

    return res.json(category);
  } catch (error: any) {
    if (error.message === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({ message: t(req, "category.notFound") });
    }

    if (error.message === "CATEGORY_READ_ONLY") {
      return res.status(400).json({ message: t(req, "category.readOnly") });
    }

    console.error("UPDATE CATEGORY ERROR:", error);
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: t(req, "auth.notAuthorized") });
    }

    await categoryService.deleteCategoryService(userId, String(req.params.id));

    return res.json({ message: t(req, "category.deletedSuccess") });
  } catch (error: any) {
    if (error.message === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({ message: t(req, "category.notFound") });
    }

    if (error.message === "CATEGORY_READ_ONLY") {
      return res.status(400).json({ message: t(req, "category.readOnly") });
    }

    console.error("DELETE CATEGORY ERROR:", error);
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};
