import axiosInstance from "@/api/axios";
import type { Locale } from "@/i18n/translations";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { queryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

export type LocalizedCategoryName = {
  en?: string;
  vi?: string;
};

export type CategoryResponse = {
  _id: string;
  name: string | LocalizedCategoryName;
  type: "income" | "expense";
  icon?: string;
  color?: string;
  isDefault?: boolean;
};

export type CategoryOption = {
  value: string;
  label: string;
  aliases?: string[];
  type?: CategoryResponse["type"];
  icon?: string;
  color?: string;
  isDefault?: boolean;
};

const EMPTY_CATEGORIES: CategoryResponse[] = [];

const fetchCategories = async () => {
  const res = await axiosInstance.get<CategoryResponse[]>("/category");
  return Array.isArray(res.data) ? res.data : EMPTY_CATEGORIES;
};

const trimCategoryText = (value?: string) =>
  typeof value === "string" ? value.trim() : "";

export const getCategoryValue = (name: CategoryResponse["name"]) => {
  if (typeof name === "string") {
    return trimCategoryText(name);
  }

  const vi = trimCategoryText(name?.vi);
  const en = trimCategoryText(name?.en);

  return vi || en;
};

export const getCategoryAliases = (name: CategoryResponse["name"]) => {
  if (typeof name === "string") {
    const value = trimCategoryText(name);
    return value ? [value] : [];
  }

  return Array.from(
    new Set([trimCategoryText(name?.vi), trimCategoryText(name?.en)].filter(Boolean)),
  );
};

export const getCategoryLabel = (
  name: CategoryResponse["name"],
  locale: Locale,
) => {
  if (typeof name === "string") {
    return trimCategoryText(name);
  }

  const vi = trimCategoryText(name?.vi);
  const en = trimCategoryText(name?.en);

  return locale === "en" ? en || vi : vi || en;
};

const normalizeCategoryOptionValue = (value?: string) =>
  trimCategoryText(value).toLowerCase();

export const matchesCategoryOption = (
  option: Pick<CategoryOption, "value" | "label" | "aliases">,
  value: string,
) => {
  const normalizedValue = normalizeCategoryOptionValue(value);

  if (!normalizedValue) return false;

  return [option.value, option.label, ...(option.aliases ?? [])].some(
    (candidate) =>
      normalizeCategoryOptionValue(candidate) === normalizedValue,
  );
};

export const useCategories = () => {
  const { locale } = useLanguage();
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories,
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (!categoriesQuery.error) return;

    toast({
      title: "Error",
      description: getErrorMessage(
        categoriesQuery.error,
        "Failed to load categories.",
      ),
      variant: "destructive",
    });
  }, [categoriesQuery.error]);

  const categories = categoriesQuery.data ?? EMPTY_CATEGORIES;

  const categoryOptions = useMemo(
    () =>
      Array.from(
        categories
          .reduce((options, category) => {
            const value = getCategoryValue(category.name);
            if (!value) return options;

            options.set(value, {
              value,
              label: getCategoryLabel(category.name, locale),
              aliases: getCategoryAliases(category.name),
              type: category.type,
              icon: category.icon,
              color: category.color,
              isDefault: category.isDefault,
            });

            return options;
          }, new Map<string, CategoryOption>())
          .values(),
      ),
    [categories, locale],
  );

  const categoryNames = useMemo(
    () => categoryOptions.map((category) => category.value),
    [categoryOptions],
  );

  return {
    categories,
    categoryOptions,
    categoryNames,
    isLoadingCategories: categoriesQuery.isLoading,
  };
};
