import axios from "axios";
import axiosInstance from "@/api/axios";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { normalizeTransactions } from "@/lib/transaction";
import { Transaction } from "@/types/transaction";
import { useCallback, useEffect, useMemo, useState } from "react";

const EMPTY_TXS: Transaction[] = [];

export const useWalletTransactions = (walletId: string | null) => {
  const { toast } = useToast();
  const [walletTxs, setWalletTxs] = useState<Record<string, Transaction[]>>({});
  const [loadingTxWalletId, setLoadingTxWalletId] = useState<string | null>(
    null,
  );

  const setTransactionsForWallet = useCallback(
    (targetWalletId: string, transactions: Transaction[]) => {
      setWalletTxs((prev) => ({
        ...prev,
        [targetWalletId]: transactions,
      }));
    },
    [],
  );

  const removeTransactionsForWallet = useCallback((targetWalletId: string) => {
    setWalletTxs((prev) => {
      const next = { ...prev };
      delete next[targetWalletId];
      return next;
    });
  }, []);

  useEffect(() => {
    if (!walletId) return;
    if (walletTxs[walletId] !== undefined) return;

    const controller = new AbortController();

    const loadTransactions = async () => {
      setLoadingTxWalletId(walletId);

      try {
        const res = await axiosInstance.get("/transaction", {
          params: { accountId: walletId, limit: 5 },
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        setTransactionsForWallet(walletId, normalizeTransactions(res.data));
      } catch (error: unknown) {
        if (controller.signal.aborted || axios.isCancel(error)) {
          return;
        }

        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;

        if (status !== 404) {
          toast({
            title: "Error",
            description: getErrorMessage(
              error,
              "Failed to load transactions.",
            ),
            variant: "destructive",
          });
        }

        setTransactionsForWallet(walletId, []);
      } finally {
        if (!controller.signal.aborted) {
          setLoadingTxWalletId((current) =>
            current === walletId ? null : current,
          );
        }
      }
    };

    void loadTransactions();

    return () => {
      controller.abort();
    };
  }, [toast, walletId, walletTxs, setTransactionsForWallet]);

  const selectedTxs = useMemo(
    () => (walletId ? walletTxs[walletId] ?? EMPTY_TXS : EMPTY_TXS),
    [walletId, walletTxs],
  );

  return {
    loadingTxWalletId,
    removeTransactionsForWallet,
    selectedTxs,
    setTransactionsForWallet,
  };
};
