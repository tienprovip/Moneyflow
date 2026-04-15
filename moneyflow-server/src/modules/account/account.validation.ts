import { z } from "zod";
import { AccountType } from "./account.model";

export const createAccountSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(AccountType),
  currencyCode: z.enum(["VND", "USD", "EUR"]).optional(),

  balance: z.number().optional(),

  initialAmount: z.number().optional(),
  interestRate: z.number().optional(),
  termMonths: z.number().optional(),
  startDate: z.string().or(z.date()).optional(),
  sourceAccountId: z.string().optional(),
  status: z.string().optional(),
});

export const updateAccountSchema = createAccountSchema.partial();

export const settleAccountSchema = z.object({
  targetAccountId: z.string().optional(),
});
