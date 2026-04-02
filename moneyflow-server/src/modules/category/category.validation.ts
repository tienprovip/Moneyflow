import { z } from "zod";
import { normalizeLocalizedText, localizedTextInputSchema } from "../../shared/localized";
import { CategoryType } from "./category.model";

export const createCategorySchema = z.object({
  name: localizedTextInputSchema.transform(normalizeLocalizedText),
  type: z.nativeEnum(CategoryType),
  icon: z.string().trim().min(1).optional(),
  color: z.string().trim().min(1).optional(),
});

export const updateCategorySchema = z.object({
  name: localizedTextInputSchema.transform(normalizeLocalizedText).optional(),
  type: z.nativeEnum(CategoryType).optional(),
  icon: z.string().trim().min(1).optional(),
  color: z.string().trim().min(1).optional(),
});

export const getCategoriesQuerySchema = z.object({
  type: z.nativeEnum(CategoryType).optional(),
});
