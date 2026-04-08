export interface Transaction {
  id: string;
  name: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  categoryId?: string;
  date: string;
  status: "completed" | "pending";
  notes?: string;
  walletId?: string;
}

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

export const CATEGORY_CONFIG: Record<string, { icon: string; color: string }> =
  {
    Lương: {
      icon: "Banknote",
      color:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    },
    Freelance: {
      icon: "Laptop",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    },
    "Đầu tư": {
      icon: "TrendingUp",
      color:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
    },
    "Ăn uống": {
      icon: "UtensilsCrossed",
      color:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
    },
    "Giải trí": {
      icon: "Gamepad2",
      color: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400",
    },
    "Hóa đơn": {
      icon: "Receipt",
      color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    },
    "Sức khỏe": {
      icon: "Heart",
      color: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
    },
    "Di chuyển": {
      icon: "Car",
      color: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
    },
    "Giáo dục": {
      icon: "BookOpen",
      color:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
    },
    "Thu nhập khác": {
      icon: "Banknote",
      color:
        "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
    },
    "Chi phí khác": {
      icon: "Receipt",
      color:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    },
  };

export const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG);
