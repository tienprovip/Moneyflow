import { z } from "zod";

const monthSchema = z.string().regex(/^\d{4}-\d{2}$/);
const yearSchema = z.string().regex(/^\d{4}$/);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const createTransactionSchema = z.object({
  accountId: z.string(),
  categoryId: z.string().optional(),
  title: z.string().trim().min(1).optional(),
  type: z.enum(["income", "expense", "transfer"]),
  toAccountId: z.string().optional(),
  amount: z.number().positive(),
  currencyCode: z.string(),
  note: z.string().optional(),
  date: z.string().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const getSummaryQuerySchema = z.object({
  month: monthSchema.optional(),
  year: yearSchema.optional(),
  from: dateSchema.optional(),
  to: dateSchema.optional(),
});
