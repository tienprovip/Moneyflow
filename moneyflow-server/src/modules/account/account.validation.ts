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
});

export const updateAccountSchema = createAccountSchema.partial();
