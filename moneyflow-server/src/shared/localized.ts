import { Schema } from "mongoose";
import { z } from "zod";

export interface LocalizedText {
  en: string;
  vi: string;
}

export const localizedTextSchema = new Schema<LocalizedText>(
  {
    en: { type: String, required: true, trim: true },
    vi: { type: String, required: true, trim: true },
  },
  { _id: false },
);

export const localizedTextZodSchema = z.object({
  en: z.string().min(1),
  vi: z.string().min(1),
});

export const localizedTextInputSchema = z.union([
  z.string().min(1),
  localizedTextZodSchema,
]);

export const normalizeLocalizedText = (value: unknown): LocalizedText => {
  if (typeof value === "string") {
    const text = value.trim();
    return { en: text, vi: text };
  }

  const parsed = localizedTextZodSchema.parse(value);

  return {
    en: parsed.en.trim(),
    vi: parsed.vi.trim(),
  };
};
