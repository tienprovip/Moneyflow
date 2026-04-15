import axiosInstance from "@/api/axios";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { queryKeys } from "@/lib/query-keys";
import {
  normalizeTransaction,
  normalizeTransactions,
} from "@/lib/transaction";
import { Transaction } from "@/types/transaction";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";

const EMPTY_TRANSACTIONS: Transaction[] = [];

type TransactionPayload = {
  accountId: string;
  amount: number;
  currencyCode: string;
  date: string;
  note: string;
  title: string;
  type: "income" | "expense" | "transfer";
  categoryId?: string;
  toAccountId?: string;
};

const fetchTransactions = async () => {
  const res = await axiosInstance.get("/transaction");
  return normalizeTransactions(res.data);
};

export const useTransactions = (enabled = true) => {
  const queryClient = useQueryClient();
  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactions,
    queryFn: fetchTransactions,
    enabled,
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (!transactionsQuery.error) return;

    toast({
      title: "Error",
      description: getErrorMessage(
        transactionsQuery.error,
        "Failed to load transactions.",
      ),
      variant: "destructive",
    });
  }, [transactionsQuery.error]);

  const invalidateWalletData = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.wallets });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.walletTransactions,
    });
  };

  const createTransactionMutation = useMutation({
    mutationFn: async (payload: TransactionPayload) => {
      const res = await axiosInstance.post("/transaction", payload);
      return normalizeTransaction(res.data);
    },
    onSuccess: (transaction) => {
      queryClient.setQueryData<Transaction[]>(
        queryKeys.transactions,
        (previous = EMPTY_TRANSACTIONS) => [transaction, ...previous],
      );
      invalidateWalletData();
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: TransactionPayload;
    }) => {
      const res = await axiosInstance.put(`/transaction/${id}`, payload);
      return normalizeTransaction(res.data);
    },
    onSuccess: (transaction) => {
      queryClient.setQueryData<Transaction[]>(
        queryKeys.transactions,
        (previous = EMPTY_TRANSACTIONS) =>
          previous.map((item) => (item.id === transaction.id ? transaction : item)),
      );
      invalidateWalletData();
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      await axiosInstance.delete(`/transaction/${transactionId}`);
      return transactionId;
    },
    onSuccess: (transactionId) => {
      queryClient.setQueryData<Transaction[]>(
        queryKeys.transactions,
        (previous = EMPTY_TRANSACTIONS) =>
          previous.filter((item) => item.id !== transactionId),
      );
      invalidateWalletData();
    },
  });

  return {
    createTransaction: createTransactionMutation.mutateAsync,
    deleteTransaction: deleteTransactionMutation.mutateAsync,
    isLoadingTransactions: transactionsQuery.isLoading,
    transactions: transactionsQuery.data ?? EMPTY_TRANSACTIONS,
    updateTransaction: updateTransactionMutation.mutateAsync,
  };
};
