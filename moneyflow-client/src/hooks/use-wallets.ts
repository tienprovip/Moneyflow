import axiosInstance from "@/api/axios";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { queryKeys } from "@/lib/query-keys";
import { Wallet, WalletType, WALLET_COLORS } from "@/types/wallet";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

type AccountResponse = {
  _id: string;
  name: string;
  type: WalletType;
  balance?: number;
};

type WalletUiMeta = {
  icon?: string;
  color?: string;
  note?: string;
};

type WalletMetaMap = Record<string, WalletUiMeta>;

export interface WalletMutationValues {
  balance: number;
  color: string;
  icon: string;
  name: string;
  note?: string;
  type: WalletType;
}

const EMPTY_ACCOUNTS: AccountResponse[] = [];
const WALLET_META_STORAGE_KEY = "moneyflow.walletMeta";

const DEFAULT_ICON_BY_TYPE: Record<WalletType, string> = {
  cash: "Wallet",
  bank: "Landmark",
  ewallet: "Smartphone",
  credit: "CreditCard",
};

const DEFAULT_COLOR_BY_TYPE: Record<WalletType, string> = {
  cash: WALLET_COLORS[0].class,
  bank: WALLET_COLORS[1].class,
  ewallet: WALLET_COLORS[2].class,
  credit: WALLET_COLORS[4].class,
};

const getStoredWalletMeta = (): WalletMetaMap => {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(WALLET_META_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as WalletMetaMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const saveStoredWalletMeta = (meta: WalletMetaMap) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WALLET_META_STORAGE_KEY, JSON.stringify(meta));
};

const mapAccountToWallet = (
  account: AccountResponse,
  walletMeta: WalletMetaMap,
): Wallet => {
  const meta = walletMeta[account._id];

  return {
    id: account._id,
    name: account.name,
    balance: account.balance ?? 0,
    type: account.type,
    icon: meta?.icon || DEFAULT_ICON_BY_TYPE[account.type],
    color: meta?.color || DEFAULT_COLOR_BY_TYPE[account.type],
    note: meta?.note,
  };
};

const fetchWalletAccounts = async () => {
  const res = await axiosInstance.get<AccountResponse[]>("/account");
  return Array.isArray(res.data) ? res.data : EMPTY_ACCOUNTS;
};

export const useWallets = () => {
  const queryClient = useQueryClient();
  const [walletMeta, setWalletMeta] = useState<WalletMetaMap>(
    getStoredWalletMeta,
  );
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const walletsQuery = useQuery({
    queryKey: queryKeys.wallets,
    queryFn: fetchWalletAccounts,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (!walletsQuery.error) return;

    toast({
      title: "Error",
      description: getErrorMessage(walletsQuery.error, "Failed to load wallets."),
      variant: "destructive",
    });
  }, [walletsQuery.error]);

  const wallets = useMemo(
    () =>
      (walletsQuery.data ?? EMPTY_ACCOUNTS).map((account) =>
        mapAccountToWallet(account, walletMeta),
      ),
    [walletMeta, walletsQuery.data],
  );

  const resolvedSelectedWallet = useMemo(() => {
    if (selectedWallet && wallets.some((wallet) => wallet.id === selectedWallet)) {
      return selectedWallet;
    }

    return wallets[0]?.id ?? null;
  }, [selectedWallet, wallets]);

  const selectWallet = useCallback((walletId: string) => {
    setSelectedWallet((current) => (current === walletId ? current : walletId));
  }, []);

  const upsertWalletMeta = useCallback((walletId: string, meta: WalletUiMeta) => {
    setWalletMeta((prev) => {
      const next = {
        ...prev,
        [walletId]: {
          ...prev[walletId],
          ...meta,
        },
      };
      saveStoredWalletMeta(next);
      return next;
    });
  }, []);

  const removeWalletMeta = useCallback((walletId: string) => {
    setWalletMeta((prev) => {
      const next = { ...prev };
      delete next[walletId];
      saveStoredWalletMeta(next);
      return next;
    });
  }, []);

  const createWalletMutation = useMutation({
    mutationFn: async (values: WalletMutationValues) => {
      const res = await axiosInstance.post<AccountResponse>("/account/create", {
        balance: values.balance,
        currencyCode: "VND",
        name: values.name,
        type: values.type,
      });

      return {
        account: res.data,
        values,
      };
    },
    onSuccess: ({ account, values }) => {
      upsertWalletMeta(account._id, {
        color: values.color,
        icon: values.icon,
        note: values.note,
      });

      queryClient.setQueryData<AccountResponse[]>(
        queryKeys.wallets,
        (previous = EMPTY_ACCOUNTS) => [account, ...previous],
      );
      setSelectedWallet(account._id);
    },
  });

  const updateWalletMutation = useMutation({
    mutationFn: async ({
      walletId,
      values,
    }: {
      walletId: string;
      values: WalletMutationValues;
    }) => {
      const res = await axiosInstance.put<AccountResponse>(
        `/account/update/${walletId}`,
        {
          balance: values.balance,
          currencyCode: "VND",
          name: values.name,
          type: values.type,
        },
      );

      return {
        account: res.data,
        values,
        walletId,
      };
    },
    onSuccess: ({ account, values, walletId }) => {
      upsertWalletMeta(walletId, {
        color: values.color,
        icon: values.icon,
        note: values.note,
      });

      queryClient.setQueryData<AccountResponse[]>(
        queryKeys.wallets,
        (previous = EMPTY_ACCOUNTS) =>
          previous.map((item) => (item._id === walletId ? account : item)),
      );
    },
  });

  const deleteWalletMutation = useMutation({
    mutationFn: async (walletId: string) => {
      setDeletingId(walletId);
      await axiosInstance.delete(`/account/delete/${walletId}`);
      return walletId;
    },
    onSuccess: (walletId) => {
      queryClient.setQueryData<AccountResponse[]>(
        queryKeys.wallets,
        (previous = EMPTY_ACCOUNTS) =>
          previous.filter((wallet) => wallet._id !== walletId),
      );
      removeWalletMeta(walletId);
      setSelectedWallet((current) => (current === walletId ? null : current));
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const createWallet = useCallback(
    async (values: WalletMutationValues) => {
      const result = await createWalletMutation.mutateAsync(values);
      return mapAccountToWallet(result.account, {
        ...walletMeta,
        [result.account._id]: {
          color: values.color,
          icon: values.icon,
          note: values.note,
        },
      });
    },
    [createWalletMutation, walletMeta],
  );

  const updateWallet = useCallback(
    async (walletId: string, values: WalletMutationValues) => {
      const result = await updateWalletMutation.mutateAsync({
        walletId,
        values,
      });

      return mapAccountToWallet(result.account, {
        ...walletMeta,
        [walletId]: {
          ...walletMeta[walletId],
          color: values.color,
          icon: values.icon,
          note: values.note,
        },
      });
    },
    [updateWalletMutation, walletMeta],
  );

  const deleteWallet = useCallback(
    async (walletId: string) => {
      if (deletingId) return false;

      await deleteWalletMutation.mutateAsync(walletId);
      return true;
    },
    [deleteWalletMutation, deletingId],
  );

  const totalBalance = useMemo(
    () => wallets.reduce((sum, wallet) => sum + wallet.balance, 0),
    [wallets],
  );

  const selectedWalletData = useMemo(
    () => wallets.find((wallet) => wallet.id === resolvedSelectedWallet) ?? null,
    [resolvedSelectedWallet, wallets],
  );

  return {
    createWallet,
    deleteWallet,
    deletingId,
    isLoadingWallets: walletsQuery.isLoading,
    selectWallet,
    selectedWallet: resolvedSelectedWallet,
    selectedWalletData,
    totalBalance,
    updateWallet,
    wallets,
  };
};
