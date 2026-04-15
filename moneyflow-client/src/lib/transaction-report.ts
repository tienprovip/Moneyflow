import type { Transaction } from "@/types/transaction";

export const isSavingOpeningBalanceIncome = (transaction: Transaction) =>
  transaction.type === "income" &&
  Boolean(transaction.isInitialBalance) &&
  transaction.accountType === "saving";

export const shouldCountAsIncome = (transaction: Transaction) =>
  transaction.type === "income" && !isSavingOpeningBalanceIncome(transaction);

export const shouldCountAsExpense = (transaction: Transaction) =>
  transaction.type === "expense";
