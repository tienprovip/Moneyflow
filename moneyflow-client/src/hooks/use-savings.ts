import axiosInstance from "@/api/axios";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { queryKeys } from "@/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

export interface AccountResponse {
  _id: string;
  name: string;
  type: string;
  balance?: number;
  initialAmount?: number;
  interestRate?: number;
  termMonths?: number;
  createdAt?: string;
  status?: string;
  sourceAccountId?: string;
  startDate?: string;
  maturityDate?: string;
  settledAmount?: number;
  settledInterest?: number;
  settledAt?: string;
  settlementAccountId?: string;
}

type SavingUiMeta = {
  note?: string;
};

type SavingMetaMap = Record<string, SavingUiMeta>;

export interface SavingsWallet {
  id: string;
  name: string;
  initialDeposit: number;
  interestRate: number;
  termMonths: number;
  note: string;
  createdAt: string;
  status: string;
  sourceAccountId?: string;
  startDate: string;
  maturityDate?: string;
  settledAmount?: number;
  settledInterest?: number;
  settledAt?: string;
  settlementAccountId?: string;
}

export interface SavingMutationValues {
  name: string;
  initialDeposit: number;
  interestRate: number;
  termMonths: number;
  note?: string;
  sourceAccountId?: string;
  startDate?: string;
}

const EMPTY_SAVINGS: AccountResponse[] = [];
const SAVING_META_STORAGE_KEY = "moneyflow.savingMeta";

const getStoredSavingMeta = (): SavingMetaMap => {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(SAVING_META_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SavingMetaMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const saveStoredSavingMeta = (meta: SavingMetaMap) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVING_META_STORAGE_KEY, JSON.stringify(meta));
};

const mapAccountToSaving = (
  account: AccountResponse,
  metaMap: SavingMetaMap,
): SavingsWallet => {
  const meta = metaMap[account._id];

  return {
    id: account._id,
    name: account.name,
    initialDeposit: account.initialAmount ?? account.balance ?? 0,
    interestRate: account.interestRate ?? 0,
    termMonths: account.termMonths ?? 0,
    note: meta?.note || "",
    createdAt: account.createdAt ?? new Date().toISOString(),
    status: account.status || 'active',
    sourceAccountId: account.sourceAccountId,
    startDate: account.startDate || new Date().toISOString(),
    maturityDate: account.maturityDate,
    settledAmount: account.settledAmount,
    settledInterest: account.settledInterest,
    settledAt: account.settledAt,
    settlementAccountId: account.settlementAccountId,
  };
};

const fetchSavingAccounts = async () => {
  const res = await axiosInstance.get<AccountResponse[]>("/account");
  if (!Array.isArray(res.data)) return EMPTY_SAVINGS;
  return res.data.filter((acc) => acc.type === "saving");
};

export const useSavings = () => {
  const queryClient = useQueryClient();
  const [savingMeta, setSavingMeta] = useState<SavingMetaMap>(getStoredSavingMeta);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const savingsQuery = useQuery({
    queryKey: [...queryKeys.wallets, "savings"], // Share invalidation logic with wallets if needed, or independent.
    queryFn: fetchSavingAccounts,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (!savingsQuery.error) return;

    toast({
      title: "Error",
      description: getErrorMessage(savingsQuery.error, "Failed to load savings."),
      variant: "destructive",
    });
  }, [savingsQuery.error]);

  const savings = useMemo(
    () =>
      (savingsQuery.data ?? EMPTY_SAVINGS).map((account) =>
        mapAccountToSaving(account, savingMeta),
      ),
    [savingMeta, savingsQuery.data],
  );

  const upsertSavingMeta = useCallback((walletId: string, meta: SavingUiMeta) => {
    setSavingMeta((prev) => {
      const next = {
        ...prev,
        [walletId]: {
          ...prev[walletId],
          ...meta,
        },
      };
      saveStoredSavingMeta(next);
      return next;
    });
  }, []);

  const removeSavingMeta = useCallback((walletId: string) => {
    setSavingMeta((prev) => {
      const next = { ...prev };
      delete next[walletId];
      saveStoredSavingMeta(next);
      return next;
    });
  }, []);

  const createSavingMutation = useMutation({
    mutationFn: async (values: SavingMutationValues) => {
      const res = await axiosInstance.post<AccountResponse>("/account/create", {
        type: "saving",
        name: values.name,
        currencyCode: "VND",
        balance: values.initialDeposit,
        initialAmount: values.initialDeposit,
        interestRate: values.interestRate,
        termMonths: values.termMonths,
        sourceAccountId: values.sourceAccountId,
        startDate: values.startDate,
      });

      return {
        account: res.data,
        values,
      };
    },
    onSuccess: ({ account, values }) => {
      upsertSavingMeta(account._id, {
        note: values.note,
      });

      queryClient.setQueryData<AccountResponse[]>(
        [...queryKeys.wallets, "savings"],
        (previous = EMPTY_SAVINGS) => [account, ...previous],
      );

      void queryClient.invalidateQueries({ queryKey: queryKeys.wallets });
      void queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });

  const updateSavingMutation = useMutation({
    mutationFn: async ({
      walletId,
      values,
    }: {
      walletId: string;
      values: SavingMutationValues;
    }) => {
      const res = await axiosInstance.put<AccountResponse>(
        `/account/update/${walletId}`,
        {
          type: "saving",
          name: values.name,
          currencyCode: "VND",
          balance: values.initialDeposit,
          initialAmount: values.initialDeposit,
          interestRate: values.interestRate,
          termMonths: values.termMonths,
          sourceAccountId: values.sourceAccountId,
          startDate: values.startDate,
        },
      );

      return {
        account: res.data,
        values,
        walletId,
      };
    },
    onSuccess: ({ account, values, walletId }) => {
      upsertSavingMeta(walletId, {
        note: values.note,
      });

      queryClient.setQueryData<AccountResponse[]>(
        [...queryKeys.wallets, "savings"],
        (previous = EMPTY_SAVINGS) =>
          previous.map((item) => (item._id === walletId ? account : item)),
      );

      void queryClient.invalidateQueries({ queryKey: queryKeys.wallets });
      void queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });

  const deleteSavingMutation = useMutation({
    mutationFn: async (walletId: string) => {
      setDeletingId(walletId);
      await axiosInstance.delete(`/account/delete/${walletId}`);
      return walletId;
    },
    onSuccess: (walletId) => {
      queryClient.setQueryData<AccountResponse[]>(
        [...queryKeys.wallets, "savings"],
        (previous = EMPTY_SAVINGS) =>
          previous.filter((wallet) => wallet._id !== walletId),
      );
      removeSavingMeta(walletId);

      void queryClient.invalidateQueries({ queryKey: queryKeys.wallets });
      void queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  
  const settleSavingMutation = useMutation({
    mutationFn: async ({
      walletId,
      targetAccountId,
    }: {
      walletId: string;
      targetAccountId?: string;
    }) => {
      const res = await axiosInstance.post<AccountResponse>(
        `/account/settle/${walletId}`,
        {
          targetAccountId,
        },
      );
      return res.data;
    },
    onSuccess: (account) => {
      queryClient.setQueryData<AccountResponse[]>(
        [...queryKeys.wallets, "savings"],
        (previous = EMPTY_SAVINGS) =>
          previous.map((item) => (item._id === account._id ? account : item)),
      );

      void queryClient.invalidateQueries({ queryKey: queryKeys.wallets });
      void queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });

  const settleSaving = useCallback(
    async (walletId: string, targetAccountId?: string) => {
      await settleSavingMutation.mutateAsync({
        walletId,
        targetAccountId,
      });
    },
    [settleSavingMutation]
  );

  const createSaving = useCallback(
    async (values: SavingMutationValues) => {
      await createSavingMutation.mutateAsync(values);
    },
    [createSavingMutation],
  );

  const updateSaving = useCallback(
    async (walletId: string, values: SavingMutationValues) => {
      await updateSavingMutation.mutateAsync({
        walletId,
        values,
      });
    },
    [updateSavingMutation],
  );

  const deleteSaving = useCallback(
    async (walletId: string) => {
      if (deletingId) return false;

      await deleteSavingMutation.mutateAsync(walletId);
      return true;
    },
    [deleteSavingMutation, deletingId],
  );

  return {
    createSaving,
    deleteSaving,
    deletingId,
    isLoadingSavings: savingsQuery.isLoading,
    savings,
    updateSaving,
    settleSaving,
  };
};
