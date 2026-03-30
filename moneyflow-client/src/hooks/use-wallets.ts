import axiosInstance from "@/api/axios";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { Wallet, WalletType, WALLET_COLORS } from "@/types/wallet";
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

export const useWallets = () => {
  const { toast } = useToast();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletMeta, setWalletMeta] = useState<WalletMetaMap>({});
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const fetchWallets = useCallback(async (metaOverride?: WalletMetaMap) => {
    const metaSource = metaOverride ?? getStoredWalletMeta();
    const res = await axiosInstance.get<AccountResponse[]>("/account");
    const nextWallets = res.data.map((account) =>
      mapAccountToWallet(account, metaSource),
    );

    setWallets(nextWallets);
    setSelectedWallet((current) => {
      if (current && nextWallets.some((wallet) => wallet.id === current)) {
        return current;
      }

      return nextWallets[0]?.id ?? null;
    });

    return nextWallets;
  }, []);

  useEffect(() => {
    const storedMeta = getStoredWalletMeta();
    setWalletMeta(storedMeta);

    const loadWallets = async () => {
      setIsLoadingWallets(true);

      try {
        await fetchWallets(storedMeta);
      } catch (error: unknown) {
        toast({
          title: "Error",
          description: getErrorMessage(error, "Failed to load wallets."),
          variant: "destructive",
        });
      } finally {
        setIsLoadingWallets(false);
      }
    };

    void loadWallets();
  }, [fetchWallets, toast]);

  const createWallet = useCallback(
    async (values: WalletMutationValues) => {
      const res = await axiosInstance.post<AccountResponse>("/account/create", {
        balance: values.balance,
        currencyCode: "VND",
        name: values.name,
        type: values.type,
      });

      const nextMeta = {
        ...walletMeta,
        [res.data._id]: {
          color: values.color,
          icon: values.icon,
          note: values.note,
        },
      };

      upsertWalletMeta(res.data._id, nextMeta[res.data._id]);

      const newWallet = mapAccountToWallet(res.data, nextMeta);
      setWallets((prev) => [newWallet, ...prev]);
      setSelectedWallet(newWallet.id);

      return newWallet;
    },
    [upsertWalletMeta, walletMeta],
  );

  const updateWallet = useCallback(
    async (walletId: string, values: WalletMutationValues) => {
      const res = await axiosInstance.put<AccountResponse>(
        `/account/update/${walletId}`,
        {
          balance: values.balance,
          currencyCode: "VND",
          name: values.name,
          type: values.type,
        },
      );

      const nextMeta = {
        ...walletMeta,
        [walletId]: {
          ...walletMeta[walletId],
          color: values.color,
          icon: values.icon,
          note: values.note,
        },
      };

      upsertWalletMeta(walletId, nextMeta[walletId]);

      const updatedWallet = mapAccountToWallet(res.data, nextMeta);
      setWallets((prev) =>
        prev.map((wallet) => (wallet.id === walletId ? updatedWallet : wallet)),
      );

      return updatedWallet;
    },
    [upsertWalletMeta, walletMeta],
  );

  const deleteWallet = useCallback(
    async (walletId: string) => {
      if (deletingId) return false;

      setDeletingId(walletId);

      try {
        await axiosInstance.delete(`/account/delete/${walletId}`);

        setWallets((prev) => prev.filter((wallet) => wallet.id !== walletId));
        removeWalletMeta(walletId);
        setSelectedWallet((current) => (current === walletId ? null : current));

        return true;
      } finally {
        setDeletingId(null);
      }
    },
    [deletingId, removeWalletMeta],
  );

  const totalBalance = useMemo(
    () => wallets.reduce((sum, wallet) => sum + wallet.balance, 0),
    [wallets],
  );

  const selectedWalletData = useMemo(
    () => wallets.find((wallet) => wallet.id === selectedWallet) ?? null,
    [selectedWallet, wallets],
  );

  return {
    createWallet,
    deleteWallet,
    deletingId,
    isLoadingWallets,
    selectWallet,
    selectedWallet,
    selectedWalletData,
    totalBalance,
    updateWallet,
    wallets,
  };
};
