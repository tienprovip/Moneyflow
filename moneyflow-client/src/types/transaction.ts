export interface Transaction {
  id: string;
  name: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  categoryId?: string;
  categoryIcon?: string;
  categoryColor?: string;
  date: string;
  status: "completed" | "pending";
  notes?: string;
  walletId?: string;
}

export type TransactionFormValues = Pick<
  Transaction,
  | "name"
  | "description"
  | "amount"
  | "type"
  | "category"
  | "date"
  | "notes"
  | "walletId"
>;

export interface TransactionFilters {
  search: string;
  category: string;
  type: "all" | "income" | "expense";
  walletId: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}
