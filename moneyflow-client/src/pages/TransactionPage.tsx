import axiosInstance from "@/api/axios";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import AddTransactionDialog from "@/components/transactions/AddTransactionDialog";
import SummaryCards from "@/components/transactions/SummaryCards";
import TransactionEmptyState from "@/components/transactions/TransactionEmptyState";
import TransactionFilters from "@/components/transactions/TransactionFilters";
import TransactionHeader from "@/components/transactions/TransactionHeader";
import TransactionMobileList from "@/components/transactions/TransactionMobileList";
import TransactionTable from "@/components/transactions/TransactionTable";
import {
  getCategoryValue,
  matchesCategoryOption,
  useCategories,
} from "@/hooks/use-categories";
import { useLanguage } from "@/hooks/use-language";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useWallets } from "@/hooks/use-wallets";
import { getErrorMessage } from "@/lib/getErrorMessage";
import {
  normalizeTransaction,
  normalizeTransactions,
} from "@/lib/transaction";
import type {
  TransactionFilters as Filters,
  Transaction,
} from "@/types/transaction";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

const Transactions = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { categories, categoryOptions: apiCategoryOptions } = useCategories();
  const { isLoadingWallets, wallets: apiWallets } = useWallets();
  const { toast } = useToast();
  const hasRedirectedToWallets = useRef(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
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

  const categoryIdByValue = useMemo(
    () =>
      new Map(
        categories
          .map((category) => [getCategoryValue(category.name), category._id] as const)
          .filter(([value]) => Boolean(value)),
      ),
    [categories],
  );

  const loadTransactions = useCallback(async () => {
    setIsLoadingTransactions(true);

    try {
      const res = await axiosInstance.get("/transaction");
      setTransactions(normalizeTransactions(res.data));
    } catch (error: unknown) {
      setTransactions([]);
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to load transactions."),
        variant: "destructive",
      });
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isLoadingWallets) return;
    if (apiWallets.length === 0) {
      setTransactions([]);
      setIsLoadingTransactions(false);
      return;
    }

    void loadTransactions();
  }, [apiWallets.length, isLoadingWallets, loadTransactions]);

  useEffect(() => {
    if (isLoadingWallets) return;
    if (apiWallets.length > 0) return;
    if (hasRedirectedToWallets.current) return;

    hasRedirectedToWallets.current = true;
    toast({
      title: t("wallets.noWalletToastTitle"),
      description: t("wallets.noWalletToastDesc"),
    });
    navigate("/wallets", { replace: true });
  }, [apiWallets.length, isLoadingWallets, navigate, t, toast]);

  const filtered = useMemo(() => {
    let result = [...transactions];

    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (transaction) =>
          transaction.name.toLowerCase().includes(query) ||
          transaction.description.toLowerCase().includes(query),
      );
    }

    if (filters.category !== "all") {
      const selectedCategory = apiCategoryOptions.find(
        (category) => category.value === filters.category,
      );

      result = result.filter(
        (transaction) =>
          transaction.category === filters.category ||
          (selectedCategory
            ? matchesCategoryOption(selectedCategory, transaction.category)
            : false),
      );
    }

    if (filters.type !== "all") {
      result = result.filter((transaction) => transaction.type === filters.type);
    }

    if (filters.walletId !== "all") {
      result = result.filter(
        (transaction) => transaction.walletId === filters.walletId,
      );
    }

    if (filters.dateRange.from) {
      result = result.filter(
        (transaction) => new Date(transaction.date) >= filters.dateRange.from!,
      );
    }

    if (filters.dateRange.to) {
      result = result.filter(
        (transaction) => new Date(transaction.date) <= filters.dateRange.to!,
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount-high":
          return b.amount - a.amount;
        case "amount-low":
          return a.amount - b.amount;
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return result;
  }, [transactions, filters, sortBy, apiCategoryOptions]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();

    transactions.forEach((transaction) => {
      if (transaction.date) {
        months.add(transaction.date.slice(0, 7));
      }
    });

    return Array.from(months).sort().reverse();
  }, [transactions]);

  const summaryTransactions = useMemo(() => {
    if (summaryMonth === "all") return transactions;

    return transactions.filter((transaction) =>
      transaction.date.startsWith(summaryMonth),
    );
  }, [transactions, summaryMonth]);

  const totalIncome = summaryTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalExpense = summaryTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const buildTransactionPayload = useCallback(
    (data: Omit<Transaction, "id" | "status">) => {
      if (!data.walletId) {
        throw new Error("Wallet is required.");
      }

      const payload = {
        accountId: data.walletId,
        amount: data.amount,
        currencyCode: "VND",
        date: data.date,
        note: data.notes?.trim() || data.description.trim() || data.name.trim(),
        title: data.name.trim(),
        type: data.type,
      };
      const categoryId = categoryIdByValue.get(data.category);

      return categoryId ? { ...payload, categoryId } : payload;
    },
    [categoryIdByValue],
  );

  const handleAdd = async (data: Omit<Transaction, "id" | "status">) => {
    try {
      const res = await axiosInstance.post(
        "/transaction",
        buildTransactionPayload(data),
      );

      setTransactions((prev) => [normalizeTransaction(res.data), ...prev]);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to create transaction."),
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleEdit = async (data: Omit<Transaction, "id" | "status">) => {
    if (!editingTransaction) return;

    try {
      const res = await axiosInstance.put(
        `/transaction/${editingTransaction.id}`,
        buildTransactionPayload(data),
      );
      const updatedTransaction = normalizeTransaction(res.data);

      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === editingTransaction.id
            ? updatedTransaction
            : transaction,
        ),
      );
      setEditingTransaction(null);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to update transaction."),
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/transaction/${id}`);
      setTransactions((prev) =>
        prev.filter((transaction) => transaction.id !== id),
      );
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to delete transaction."),
        variant: "destructive",
      });
    }
  };

  const openEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setDialogOpen(true);
  };

  if (!isLoadingWallets && apiWallets.length === 0) {
    return null;
  }

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
        allTransactions={transactions}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        selectedMonth={summaryMonth}
        onMonthChange={setSummaryMonth}
        availableMonths={availableMonths}
        transactions={summaryTransactions}
      />
      <TransactionFilters
        filters={filters}
        onFiltersChange={(nextFilters) => {
          setFilters(nextFilters);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categories={apiCategoryOptions}
        wallets={apiWallets}
      />

      {isLoadingTransactions ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
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
          wallets={apiWallets}
        />
      ) : (
        <TransactionTable
          transactions={paginated}
          onEdit={openEdit}
          onDelete={handleDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          wallets={apiWallets}
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
        wallets={apiWallets}
        allCategories={apiCategoryOptions}
      />
    </DashboardLayout>
  );
};

export default Transactions;
