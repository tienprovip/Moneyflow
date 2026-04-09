import axiosInstance from "@/api/axios";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { queryKeys } from "@/lib/query-keys";
import { normalizeTransactions } from "@/lib/transaction";
import { Transaction } from "@/types/transaction";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

const EMPTY_TXS: Transaction[] = [];

const fetchWalletTransactions = async (walletId: string) => {
  const res = await axiosInstance.get("/transaction", {
    params: { accountId: walletId, limit: 5 },
  });

  return normalizeTransactions(res.data);
};

export const useWalletTransactions = (walletId: string | null) => {
  const queryClient = useQueryClient();
  const walletTransactionsQuery = useQuery({
    queryKey: walletId
      ? queryKeys.walletTransactionsById(walletId)
      : [...queryKeys.walletTransactions, "empty"],
    queryFn: () => fetchWalletTransactions(walletId!),
    enabled: Boolean(walletId),
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (!walletTransactionsQuery.error) return;

    toast({
      title: "Error",
      description: getErrorMessage(
        walletTransactionsQuery.error,
        "Failed to load transactions.",
      ),
      variant: "destructive",
    });
  }, [walletTransactionsQuery.error]);

  const removeTransactionsForWallet = useCallback(
    (targetWalletId: string) => {
      queryClient.removeQueries({
        queryKey: queryKeys.walletTransactionsById(targetWalletId),
        exact: true,
      });
    },
    [queryClient],
  );

  return {
    loadingTxWalletId:
      walletId && walletTransactionsQuery.isLoading ? walletId : null,
    removeTransactionsForWallet,
    selectedTxs: walletTransactionsQuery.data ?? EMPTY_TXS,
  };
};
