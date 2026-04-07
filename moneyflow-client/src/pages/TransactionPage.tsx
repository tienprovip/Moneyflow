import { DashboardLayout } from "@/components/layout/DashboardLayout";
import AddTransactionDialog from "@/components/transactions/AddTransactionDialog";
import SummaryCards from "@/components/transactions/SummaryCards";
import TransactionEmptyState from "@/components/transactions/TransactionEmptyState";
import TransactionFilters from "@/components/transactions/TransactionFilters";
import TransactionHeader from "@/components/transactions/TransactionHeader";
import TransactionMobileList from "@/components/transactions/TransactionMobileList";
import TransactionTable from "@/components/transactions/TransactionTable";
import { useIsMobile } from "@/hooks/use-mobile";
import type {
  TransactionFilters as Filters,
  Transaction,
} from "@/types/transaction";
import { ALL_CATEGORIES } from "@/types/transaction";
import { useMemo, useState } from "react";

const WALLETS = [
  { id: "1", name: "Tiền mặt" },
  { id: "2", name: "Vietcombank" },
  { id: "3", name: "MoMo" },
  { id: "4", name: "Visa Techcombank" },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    name: "Lương tháng",
    description: "Lương hàng tháng",
    amount: 85000000,
    type: "income",
    category: "Lương",
    date: "2026-03-01",
    status: "completed",
    walletId: "2",
  },
  {
    id: "2",
    name: "Đi chợ",
    description: "Mua thực phẩm hàng tuần",
    amount: 1200000,
    type: "expense",
    category: "Ăn uống",
    date: "2026-03-02",
    status: "completed",
    walletId: "1",
  },
  {
    id: "3",
    name: "Netflix",
    description: "Gói đăng ký hàng tháng",
    amount: 260000,
    type: "expense",
    category: "Giải trí",
    date: "2026-03-03",
    status: "completed",
    walletId: "4",
  },
  {
    id: "4",
    name: "Dự án freelance",
    description: "Thiết kế web",
    amount: 15000000,
    type: "income",
    category: "Freelance",
    date: "2026-03-04",
    status: "completed",
    walletId: "2",
  },
  {
    id: "5",
    name: "Tiền điện",
    description: "Hóa đơn điện hàng tháng",
    amount: 850000,
    type: "expense",
    category: "Hóa đơn",
    date: "2026-03-05",
    status: "pending",
    walletId: "2",
  },
  {
    id: "6",
    name: "Cà phê",
    description: "Highlands Coffee",
    amount: 75000,
    type: "expense",
    category: "Ăn uống",
    date: "2026-03-05",
    status: "completed",
    walletId: "3",
  },
  {
    id: "7",
    name: "Lợi nhuận đầu tư",
    description: "Cổ tức cổ phiếu",
    amount: 3200000,
    type: "income",
    category: "Đầu tư",
    date: "2026-03-06",
    status: "completed",
    walletId: "2",
  },
  {
    id: "8",
    name: "Phòng gym",
    description: "Phí thành viên hàng tháng",
    amount: 800000,
    type: "expense",
    category: "Sức khỏe",
    date: "2026-03-06",
    status: "completed",
    walletId: "1",
  },
  {
    id: "9",
    name: "Grab",
    description: "Di chuyển đến công ty",
    amount: 120000,
    type: "expense",
    category: "Di chuyển",
    date: "2026-03-07",
    status: "completed",
    walletId: "3",
  },
  {
    id: "10",
    name: "Mua sách",
    description: "Sách thiết kế",
    amount: 450000,
    type: "expense",
    category: "Giáo dục",
    date: "2026-03-07",
    status: "completed",
    walletId: "1",
  },
  {
    id: "11",
    name: "Tiền nhà",
    description: "Tiền thuê nhà hàng tháng",
    amount: 8000000,
    type: "expense",
    category: "Hóa đơn",
    date: "2026-03-01",
    status: "completed",
    walletId: "2",
  },
  {
    id: "12",
    name: "Dự án phụ",
    description: "Dự án ứng dụng mobile",
    amount: 8500000,
    type: "income",
    category: "Freelance",
    date: "2026-02-28",
    status: "completed",
    walletId: "2",
  },
];

const PAGE_SIZE = 10;

const Transactions = () => {
  const isMobile = useIsMobile();
  const [transactions, setTransactions] =
    useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [summaryMonth, setSummaryMonth] = useState<string>("all");
  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "all",
    type: "all",
    walletId: "all",
    dateRange: { from: undefined, to: undefined },
  });

  const filtered = useMemo(() => {
    let result = [...transactions];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      );
    }
    if (filters.category !== "all") {
      result = result.filter((t) => t.category === filters.category);
    }
    if (filters.type !== "all") {
      result = result.filter((t) => t.type === filters.type);
    }
    if (filters.walletId !== "all") {
      result = result.filter((t) => t.walletId === filters.walletId);
    }
    if (filters.dateRange.from) {
      result = result.filter(
        (t) => new Date(t.date) >= filters.dateRange.from!,
      );
    }
    if (filters.dateRange.to) {
      result = result.filter((t) => new Date(t.date) <= filters.dateRange.to!);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount-high":
          return b.amount - a.amount;
        case "amount-low":
          return a.amount - b.amount;
        default: // newest
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return result;
  }, [transactions, filters, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Available months from transactions
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((t) => {
      months.add(t.date.slice(0, 7)); // "YYYY-MM"
    });
    return Array.from(months).sort().reverse();
  }, [transactions]);

  // Summary filtered by month
  const summaryTransactions = useMemo(() => {
    if (summaryMonth === "all") return transactions;
    return transactions.filter((t) => t.date.startsWith(summaryMonth));
  }, [transactions, summaryMonth]);

  const totalIncome = summaryTransactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = summaryTransactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const handleAdd = (data: Omit<Transaction, "id" | "status">) => {
    const newTx: Transaction = {
      ...data,
      id: crypto.randomUUID(),
      status: "completed",
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleEdit = (data: Omit<Transaction, "id" | "status">) => {
    if (!editingTransaction) return;
    setTransactions((prev) =>
      prev.map((t) => (t.id === editingTransaction.id ? { ...t, ...data } : t)),
    );
    setEditingTransaction(null);
  };

  const handleDelete = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const openEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setDialogOpen(true);
  };

  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const allCategories = useMemo(() => {
    const fromTx = transactions.map((t) => t.category);
    return [...new Set([...ALL_CATEGORIES, ...customCategories, ...fromTx])];
  }, [transactions, customCategories]);

  const handleAddCategory = (cat: string) => {
    if (!allCategories.includes(cat)) {
      setCustomCategories((prev) => [...prev, cat]);
    }
  };

  const categories = [...new Set(transactions.map((t) => t.category))];

  return (
    <DashboardLayout
      onFabClick={() => {
        setEditingTransaction(null);
        setDialogOpen(true);
      }}
    >
      <TransactionHeader
        onAddClick={() => {
          setEditingTransaction(null);
          setDialogOpen(true);
        }}
      />
      <SummaryCards
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        selectedMonth={summaryMonth}
        onMonthChange={setSummaryMonth}
        availableMonths={availableMonths}
        transactions={summaryTransactions}
      />
      <TransactionFilters
        filters={filters}
        onFiltersChange={(f) => {
          setFilters(f);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categories={categories}
        wallets={WALLETS}
      />

      {transactions.length === 0 ? (
        <TransactionEmptyState
          onAddClick={() => {
            setEditingTransaction(null);
            setDialogOpen(true);
          }}
        />
      ) : isMobile ? (
        <TransactionMobileList
          transactions={paginated}
          onEdit={openEdit}
          onDelete={handleDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          wallets={WALLETS}
        />
      ) : (
        <TransactionTable
          transactions={paginated}
          onEdit={openEdit}
          onDelete={handleDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          wallets={WALLETS}
        />
      )}

      <AddTransactionDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingTransaction(null);
        }}
        onSave={editingTransaction ? handleEdit : handleAdd}
        editingTransaction={editingTransaction}
        wallets={WALLETS}
        allCategories={allCategories}
        onAddCategory={handleAddCategory}
      />
    </DashboardLayout>
  );
};

export default Transactions;
