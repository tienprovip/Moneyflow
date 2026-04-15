import { DashboardLayout } from "@/components/layout/DashboardLayout";
import AddTransactionDialog from "@/components/transactions/AddTransactionDialog";
import SummaryCards from "@/components/transactions/SummaryCards";
import TransactionEmptyState from "@/components/transactions/TransactionEmptyState";
import TransactionFilters from "@/components/transactions/TransactionFilters";
import TransactionHeader from "@/components/transactions/TransactionHeader";
import TransactionMobileList from "@/components/transactions/TransactionMobileList";
import TransactionTable from "@/components/transactions/TransactionTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  getCategoryValue,
  matchesCategoryOption,
  useCategories,
} from "@/hooks/use-categories";
import type { CategoryOption } from "@/hooks/use-categories";
import { useLanguage } from "@/hooks/use-language";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/hooks/use-transactions";
import { useWallets } from "@/hooks/use-wallets";
import { getErrorMessage } from "@/lib/getErrorMessage";
import {
  shouldCountAsExpense,
  shouldCountAsIncome,
} from "@/lib/transaction-report";
import type {
  TransactionFilters as Filters,
  Transaction,
  TransactionFormValues,
} from "@/types/transaction";
import { Loader2 } from "lucide-react";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;
const INITIAL_FILTERS: Filters = {
  search: "",
  category: "all",
  type: "all",
  walletId: "all",
  dateRange: { from: undefined, to: undefined },
};

type IndexedTransaction = {
  dateValue: number;
  searchValue: string;
  transaction: Transaction;
};

const buildCategoryLabelMap = (categories: CategoryOption[]) => {
  const labels: Record<string, string> = {};

  categories.forEach((category) => {
    [category.value, category.label, ...(category.aliases ?? [])].forEach(
      (candidate) => {
        const key = candidate.trim().toLowerCase();
        if (!key || labels[key]) return;
        labels[key] = category.label;
      },
    );
  });

  return labels;
};

const Transactions = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { categories, categoryOptions: apiCategoryOptions } = useCategories();
  const { isLoadingWallets, wallets: apiWallets } = useWallets();
  const { toast } = useToast();
  const hasRedirectedToWallets = useRef(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [summaryMonth, setSummaryMonth] = useState<string>("all");
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const shouldLoadTransactions = !isLoadingWallets && apiWallets.length > 0;
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const {
    createTransaction,
    deleteTransaction,
    isLoadingTransactions,
    transactions,
    updateTransaction,
  } = useTransactions(shouldLoadTransactions);
  const deferredSearch = useDeferredValue(filters.search);

  const walletNames = useMemo(
    () =>
      apiWallets.reduce<Record<string, string>>((result, wallet) => {
        result[wallet.id] = wallet.name;
        return result;
      }, {}),
    [apiWallets],
  );

  const categoryLabels = useMemo(
    () => buildCategoryLabelMap(apiCategoryOptions),
    [apiCategoryOptions],
  );

  const categoryIdByValue = useMemo(
    () =>
      new Map(
        categories
          .map(
            (category) =>
              [getCategoryValue(category.name), category._id] as const,
          )
          .filter(([value]) => Boolean(value)),
      ),
    [categories],
  );

  const indexedTransactions = useMemo<IndexedTransaction[]>(
    () =>
      transactions.map((transaction) => ({
        dateValue: new Date(transaction.date).getTime(),
        searchValue:
          `${transaction.name} ${transaction.description}`.toLowerCase(),
        transaction,
      })),
    [transactions],
  );

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

  const selectedCategory = useMemo(
    () =>
      filters.category === "all"
        ? null
        : (apiCategoryOptions.find(
            (category) => category.value === filters.category,
          ) ?? null),
    [apiCategoryOptions, filters.category],
  );

  const searchQuery = deferredSearch.trim().toLowerCase();
  const fromTime = filters.dateRange.from?.getTime() ?? null;
  const toTime = filters.dateRange.to?.getTime() ?? null;

  const filteredTransactions = useMemo(() => {
    let result = indexedTransactions;

    if (searchQuery) {
      result = result.filter((item) => item.searchValue.includes(searchQuery));
    }

    if (selectedCategory) {
      result = result.filter(
        ({ transaction }) =>
          transaction.category === filters.category ||
          matchesCategoryOption(selectedCategory, transaction.category),
      );
    }

    if (filters.type !== "all") {
      result = result.filter(
        ({ transaction }) => transaction.type === filters.type,
      );
    }

    if (filters.walletId !== "all") {
      result = result.filter(
        ({ transaction }) => transaction.walletId === filters.walletId,
      );
    }

    if (fromTime !== null) {
      result = result.filter(({ dateValue }) => dateValue >= fromTime);
    }

    if (toTime !== null) {
      result = result.filter(({ dateValue }) => dateValue <= toTime);
    }

    const sorted = [...result].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return a.dateValue - b.dateValue;
        case "amount-high":
          return b.transaction.amount - a.transaction.amount;
        case "amount-low":
          return a.transaction.amount - b.transaction.amount;
        default:
          return b.dateValue - a.dateValue;
      }
    });

    return sorted.map(({ transaction }) => transaction);
  }, [
    filters.category,
    filters.type,
    filters.walletId,
    fromTime,
    indexedTransactions,
    searchQuery,
    selectedCategory,
    sortBy,
    toTime,
  ]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE)),
    [filteredTransactions.length],
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTransactions = useMemo(
    () =>
      filteredTransactions.slice(
        (safeCurrentPage - 1) * PAGE_SIZE,
        safeCurrentPage * PAGE_SIZE,
      ),
    [filteredTransactions, safeCurrentPage],
  );

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
  }, [summaryMonth, transactions]);

  const { totalExpense, totalIncome } = useMemo(
    () =>
      summaryTransactions.reduce(
        (totals, transaction) => {
          if (shouldCountAsIncome(transaction)) {
            totals.totalIncome += transaction.amount;
          }

          if (shouldCountAsExpense(transaction)) {
            totals.totalExpense += transaction.amount;
          }

          return totals;
        },
        { totalExpense: 0, totalIncome: 0 },
      ),
    [summaryTransactions],
  );

  const buildTransactionPayload = useCallback(
    (data: TransactionFormValues) => {
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

  const openCreateDialog = useCallback(() => {
    setEditingTransaction(null);
    setDialogOpen(true);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingTransaction(null);
    }
  }, []);

  const handleFiltersChange = useCallback((nextFilters: Filters) => {
    setFilters(nextFilters);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((nextSort: string) => {
    setSortBy((current) => (current === nextSort ? current : nextSort));
  }, []);

  const handleSummaryMonthChange = useCallback((month: string) => {
    setSummaryMonth((current) => (current === month ? current : month));
  }, []);

  const handleAdd = useCallback(
    async (data: TransactionFormValues) => {
      try {
        await createTransaction(buildTransactionPayload(data));
      } catch (error: unknown) {
        toast({
          title: "Error",
          description: getErrorMessage(error, "Failed to create transaction."),
          variant: "destructive",
        });
        throw error;
      }
    },
    [buildTransactionPayload, createTransaction, toast],
  );

  const handleEdit = useCallback(
    async (data: TransactionFormValues) => {
      if (!editingTransaction) return;

      try {
        await updateTransaction({
          id: editingTransaction.id,
          payload: buildTransactionPayload(data),
        });
        setEditingTransaction(null);
      } catch (error: unknown) {
        toast({
          title: "Error",
          description: getErrorMessage(error, "Failed to update transaction."),
          variant: "destructive",
        });
        throw error;
      }
    },
    [buildTransactionPayload, editingTransaction, toast, updateTransaction],
  );

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteId) return;
    try {
      await deleteTransaction(deleteId);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to delete transaction."),
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  }, [deleteId, deleteTransaction, toast]);

  const openEdit = useCallback((transaction: Transaction) => {
    if (transaction.type === "transfer") return;
    setEditingTransaction(transaction);
    setDialogOpen(true);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const dialogSaveHandler = useMemo(
    () => (editingTransaction ? handleEdit : handleAdd),
    [editingTransaction, handleAdd, handleEdit],
  );

  if (!isLoadingWallets && apiWallets.length === 0) {
    return null;
  }

  return (
    <DashboardLayout onFabClick={openCreateDialog}>
      <TransactionHeader onAddClick={openCreateDialog} />
      <SummaryCards
        allTransactions={transactions}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        selectedMonth={summaryMonth}
        onMonthChange={handleSummaryMonthChange}
        availableMonths={availableMonths}
        transactions={summaryTransactions}
      />
      <TransactionFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        categories={apiCategoryOptions}
        wallets={apiWallets}
      />

      {isLoadingTransactions ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <TransactionEmptyState onAddClick={openCreateDialog} />
      ) : isMobile ? (
        <TransactionMobileList
          categoryLabels={categoryLabels}
          currentPage={safeCurrentPage}
          onDelete={handleDelete}
          onEdit={openEdit}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          transactions={paginatedTransactions}
          walletNames={walletNames}
        />
      ) : (
        <TransactionTable
          categoryLabels={categoryLabels}
          currentPage={safeCurrentPage}
          onDelete={handleDelete}
          onEdit={openEdit}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          transactions={paginatedTransactions}
          walletNames={walletNames}
        />
      )}

      <AddTransactionDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        onSave={dialogSaveHandler}
        editingTransaction={editingTransaction}
        wallets={apiWallets}
        allCategories={apiCategoryOptions}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
      />
    </DashboardLayout>
  );
};

export default Transactions;
