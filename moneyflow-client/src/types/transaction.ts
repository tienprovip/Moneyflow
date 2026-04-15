export type TransactionType = "income" | "expense" | "transfer";

export interface Transaction {
  id: string;
  name: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  categoryId?: string;
  categoryIcon?: string;
  categoryColor?: string;
  date: string;
  status: "completed" | "pending";
  notes?: string;
  walletId?: string;
  toWalletId?: string;
  fromWalletName?: string;
  toWalletName?: string;
  accountType?: string;
  isInitialBalance?: boolean;
  isSavingInterest?: boolean;
}

export interface TransactionFormValues {
  name: string;
  description: string;
  amount: number;
  type: Extract<TransactionType, "income" | "expense">;
  category: string;
  date: string;
  notes?: string;
  walletId?: string;
}

export interface TransactionFilters {
  search: string;
  category: string;
  type: "all" | "income" | "expense" | "transfer";
  walletId: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}
