import CategoryModel from "./category.model";
import { CategoryType } from "./category.model";
import { z } from "zod";
import {
  createCategorySchema,
  getCategoriesQuerySchema,
  updateCategorySchema,
} from "./category.validation";

type CreateCategoryInput = z.infer<typeof createCategorySchema>;
type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
type GetCategoriesQuery = z.infer<typeof getCategoriesQuerySchema>;

const getAccessibleCategoryFilter = (userId: string) => ({
  $or: [{ userId }, { isDefault: true }],
});

const getEditableCategory = async (userId: string, categoryId: string) => {
  const category = await CategoryModel.findOne({
    _id: categoryId,
    ...getAccessibleCategoryFilter(userId),
  });

  if (!category) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  if (category.isDefault || String(category.userId) !== userId) {
    throw new Error("CATEGORY_READ_ONLY");
  }

  return category;
};

export const createCategoryService = async (
  userId: string,
  data: CreateCategoryInput,
) => {
  return CategoryModel.create({
    userId,
    name: data.name,
    type: data.type,
    icon: data.icon,
    color: data.color,
    isDefault: false,
  });
};

export const getCategoriesService = async (
  userId: string,
  query: GetCategoriesQuery,
) => {
  const filter: {
    $or: Array<{ userId: string } | { isDefault: boolean }>;
    type?: CategoryType;
  } = getAccessibleCategoryFilter(userId);

  if (query.type) {
    filter.type = query.type;
  }

  return CategoryModel.find(filter).sort({ isDefault: -1, createdAt: -1 });
};

export const getCategoryByIdService = async (
  userId: string,
  categoryId: string,
) => {
  return CategoryModel.findOne({
    _id: categoryId,
    ...getAccessibleCategoryFilter(userId),
  });
};

export const updateCategoryService = async (
  userId: string,
  categoryId: string,
  data: UpdateCategoryInput,
) => {
  const category = await getEditableCategory(userId, categoryId);

  Object.assign(category, data);

  await category.save();

  return category;
};

export const deleteCategoryService = async (
  userId: string,
  categoryId: string,
) => {
  const category = await getEditableCategory(userId, categoryId);

  await category.deleteOne();

  return true;
};
