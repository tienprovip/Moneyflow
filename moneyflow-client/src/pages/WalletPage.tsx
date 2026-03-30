import axiosInstance from "@/api/axios";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import WalletDetailPanel from "@/components/wallets/WalletDetailPanel";
import WalletIcon from "@/components/wallets/WalletIcon";
import WalletListPanel from "@/components/wallets/WalletListPanel";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { fmtVND, formatVND } from "@/lib/format";
import { Transaction } from "@/types/transaction";
import {
  Wallet,
  WALLET_COLORS,
  WALLET_ICONS,
  WALLET_TYPE_LABELS,
  WalletType,
} from "@/types/wallet";
import { Loader2, Plus } from "lucide-react";
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
type WalletFormErrors = Partial<Record<"name" | "balance" | "note", string>>;
type WalletFormTouched = Record<keyof WalletFormErrors, boolean>;

const WALLET_META_STORAGE_KEY = "moneyflow.walletMeta";
const MAX_NOTE_LENGTH = 255;

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

const parseFormattedBalance = (value: string): number | null => {
  const trimmedValue = value.trim();

  if (!trimmedValue) return null;

  const isNegative = trimmedValue.startsWith("-");
  const digits = trimmedValue.replace(/\D/g, "");

  if (!digits) return null;

  const parsedValue = Number(`${isNegative ? "-" : ""}${digits}`);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const formatBalanceInput = (value: string): string => {
  const trimmedValue = value.trim();

  if (!trimmedValue) return "";

  const isNegative = trimmedValue.startsWith("-");
  const digits = trimmedValue.replace(/\D/g, "");

  if (!digits) {
    return isNegative ? "-" : "";
  }

  return `${isNegative ? "-" : ""}${formatVND(Number(digits))}`;
};

const formatBalanceFromNumber = (value: number): string => {
  const absoluteValue = Math.abs(Math.trunc(value));
  const formattedValue = formatVND(absoluteValue);

  return value < 0 ? `-${formattedValue}` : formattedValue;
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

const normalizeTransactions = (data: unknown): Transaction[] => {
  if (!Array.isArray(data)) return [];

  return data.map((item, index) => {
    const tx = item as Record<string, unknown>;
    const amount = Number(tx.amount ?? 0);
    const type = tx.type === "income" ? "income" : "expense";

    return {
      id: String(tx._id ?? tx.id ?? index),
      name: String(tx.name ?? tx.title ?? "Transaction"),
      description: String(tx.description ?? ""),
      amount: Number.isFinite(amount) ? amount : 0,
      type,
      category: String(tx.category ?? "Other"),
      date: String(tx.date ?? tx.createdAt ?? ""),
      status: tx.status === "pending" ? "pending" : "completed",
      notes: typeof tx.notes === "string" ? tx.notes : undefined,
    };
  });
};

const EMPTY_TXS: Transaction[] = [];

const WalletPage = () => {
  const { t, locale } = useLanguage();
  const { toast } = useToast();

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletTxs, setWalletTxs] = useState<Record<string, Transaction[]>>({});
  const [walletMeta, setWalletMeta] = useState<WalletMetaMap>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Wallet | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingTxWalletId, setLoadingTxWalletId] = useState<string | null>(
    null,
  );

  const [formName, setFormName] = useState("");
  const [formBalance, setFormBalance] = useState("");
  const [formType, setFormType] = useState<WalletType>("cash");
  const [formIcon, setFormIcon] = useState<string>("Wallet");
  const [formColor, setFormColor] = useState<string>(WALLET_COLORS[0].class);
  const [formNote, setFormNote] = useState("");
  const [formTouched, setFormTouched] = useState<WalletFormTouched>({
    name: false,
    balance: false,
    note: false,
  });

  const totalBalance = useMemo(
    () => wallets.reduce((sum, wallet) => sum + wallet.balance, 0),
    [wallets],
  );

  const getWalletFormErrors = useCallback(
    (showAllErrors = false): WalletFormErrors => {
      const errors: WalletFormErrors = {};
      const shouldValidateName = showAllErrors || formTouched.name;
      const shouldValidateBalance = showAllErrors || formTouched.balance;
      const shouldValidateNote = showAllErrors || formTouched.note;

      if (shouldValidateName && !formName.trim()) {
        errors.name = t("validation.nameRequired");
      }

      if (shouldValidateBalance && !formBalance.trim()) {
        errors.balance = t("validation.balanceRequired");
      } else if (
        shouldValidateBalance &&
        parseFormattedBalance(formBalance) === null
      ) {
        errors.balance = t("validation.balanceInvalid");
      }

      if (shouldValidateNote && formNote.trim().length > MAX_NOTE_LENGTH) {
        errors.note = t("validation.noteTooLong");
      }

      return errors;
    },
    [formBalance, formName, formNote, formTouched, t],
  );

  const formErrors = useMemo(
    () => getWalletFormErrors(false),
    [getWalletFormErrors],
  );

  const handleBalanceChange = useCallback((value: string) => {
    setFormBalance(formatBalanceInput(value));
  }, []);

  const touchFormField = useCallback((field: keyof WalletFormTouched) => {
    setFormTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const resetFormValidation = useCallback(() => {
    setFormTouched({
      name: false,
      balance: false,
      note: false,
    });
  }, []);

  const upsertWalletMeta = useCallback(
    (walletId: string, meta: WalletUiMeta) => {
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
    },
    [],
  );

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
  }, []);

  const fetchWalletTransactions = useCallback(
    async (walletId: string) => {
      setLoadingTxWalletId(walletId);

      try {
        const res = await axiosInstance.get(`/transactions`, {
          params: { accountId: walletId },
        });

        setWalletTxs((prev) => ({
          ...prev,
          [walletId]: normalizeTransactions(res.data),
        }));
      } catch (error: any) {
        const status = error?.response?.status;

        if (status !== 404) {
          toast({
            title: "Error",
            description:
              error?.response?.data?.message || "Failed to load transactions.",
            variant: "destructive",
          });
        }

        setWalletTxs((prev) => ({
          ...prev,
          [walletId]: [],
        }));
      } finally {
        setLoadingTxWalletId((current) =>
          current === walletId ? null : current,
        );
      }
    },
    [toast],
  );

  useEffect(() => {
    const storedMeta = getStoredWalletMeta();
    setWalletMeta(storedMeta);

    const loadWallets = async () => {
      setIsLoadingWallets(true);

      try {
        await fetchWallets(storedMeta);
      } catch (error: any) {
        toast({
          title: "Error",
          description:
            error?.response?.data?.message || "Failed to load wallets.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingWallets(false);
      }
    };

    void loadWallets();
  }, [fetchWallets, toast]);

  useEffect(() => {
    if (!selectedWallet) return;
    if (walletTxs[selectedWallet]) return;
    void fetchWalletTransactions(selectedWallet);
  }, [fetchWalletTransactions, selectedWallet, walletTxs]);

  const openAdd = useCallback(() => {
    setEditing(null);
    setFormName("");
    setFormBalance("");
    setFormType("cash");
    setFormIcon("Wallet");
    setFormColor(WALLET_COLORS[0].class);
    setFormNote("");
    resetFormValidation();
    setDialogOpen(true);
  }, [resetFormValidation]);

  const openEdit = useCallback((wallet: Wallet) => {
    setEditing(wallet);
    setFormName(wallet.name);
    setFormBalance(formatBalanceFromNumber(wallet.balance));
    setFormType(wallet.type);
    setFormIcon(wallet.icon);
    setFormColor(wallet.color);
    setFormNote(wallet.note || "");
    resetFormValidation();
    setDialogOpen(true);
  }, [resetFormValidation]);

  const handleWalletSelect = useCallback((walletId: string) => {
    setSelectedWallet((current) => (current === walletId ? current : walletId));
  }, []);

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    setFormTouched({
      name: true,
      balance: true,
      note: true,
    });

    const nextErrors = getWalletFormErrors(true);
    if (Object.keys(nextErrors).length > 0) return;

    const balance = parseFormattedBalance(formBalance);
    if (balance === null) return;

    setIsSaving(true);

    try {
      if (editing) {
        const res = await axiosInstance.put<AccountResponse>(
          `/account/update/${editing.id}`,
          {
            name: formName.trim(),
            type: formType,
            balance,
            currencyCode: "VND",
          },
        );

        upsertWalletMeta(editing.id, {
          icon: formIcon,
          color: formColor,
          note: formNote || undefined,
        });

        const updatedWallet = mapAccountToWallet(res.data, {
          ...walletMeta,
          [editing.id]: {
            ...walletMeta[editing.id],
            icon: formIcon,
            color: formColor,
            note: formNote || undefined,
          },
        });

        setWallets((prev) =>
          prev.map((wallet) =>
            wallet.id === editing.id ? updatedWallet : wallet,
          ),
        );

        toast({
          title: t("wallets.updated"),
          description: t("wallets.updatedDesc"),
        });
      } else {
        const res = await axiosInstance.post<AccountResponse>(
          "/account/create",
          {
            name: formName.trim(),
            type: formType,
            balance,
            currencyCode: "VND",
          },
        );

        upsertWalletMeta(res.data._id, {
          icon: formIcon,
          color: formColor,
          note: formNote || undefined,
        });

        const newWallet = mapAccountToWallet(res.data, {
          ...walletMeta,
          [res.data._id]: {
            icon: formIcon,
            color: formColor,
            note: formNote || undefined,
          },
        });

        setWallets((prev) => [newWallet, ...prev]);
        setWalletTxs((prev) => ({ ...prev, [newWallet.id]: [] }));
        setSelectedWallet(newWallet.id);

        toast({
          title: t("wallets.added"),
          description: t("wallets.addedDesc"),
        });
      }

      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to save wallet.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    editing,
    formBalance,
    formColor,
    getWalletFormErrors,
    formIcon,
    formName,
    formNote,
    formType,
    isSaving,
    t,
    toast,
    upsertWalletMeta,
    walletMeta,
  ]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (deletingId) return;

      setDeletingId(id);

      try {
        await axiosInstance.delete(`/account/delete/${id}`);

        setWallets((prev) => prev.filter((wallet) => wallet.id !== id));
        setWalletTxs((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        removeWalletMeta(id);

        setSelectedWallet((current) => (current === id ? null : current));

        toast({
          title: t("wallets.deleted"),
          description: t("wallets.deletedDesc"),
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description:
            error?.response?.data?.message || "Failed to delete wallet.",
          variant: "destructive",
        });
      } finally {
        setDeletingId(null);
      }
    },
    [deletingId, removeWalletMeta, t, toast],
  );

  const handleDeleteWallet = useCallback(
    (walletId: string) => {
      void handleDelete(walletId);
    },
    [handleDelete],
  );

  const selectedWalletData = useMemo(
    () => wallets.find((wallet) => wallet.id === selectedWallet) ?? null,
    [selectedWallet, wallets],
  );
  const selectedTxs = useMemo(
    () => (selectedWallet ? walletTxs[selectedWallet] ?? EMPTY_TXS : EMPTY_TXS),
    [selectedWallet, walletTxs],
  );

  return (
    <DashboardLayout onFabClick={openAdd}>
      <div className="flex flex-col gap-3 mb-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {t("wallets.pageTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("wallets.pageSubtitle")}
          </p>
        </div>
        <Button onClick={openAdd} className="hidden lg:flex gap-2">
          <Plus className="w-4 h-4" />
          {t("wallets.addWallet")}
        </Button>
      </div>

      <Card className="mb-4 sm:mb-6">
        <CardContent className="py-4 sm:py-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {t("wallets.totalBalance")}
            </p>
            <p
              className={`text-2xl sm:text-3xl font-bold text-money ${totalBalance >= 0 ? "text-positive" : "text-negative"}`}
            >
              {fmtVND(totalBalance)}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {wallets.length} {t("wallets.walletCount")}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1 space-y-3">
          <WalletListPanel
            addFirstLabel={t("wallets.addFirst")}
            emptyTitle={t("wallets.emptyTitle")}
            isLoadingWallets={isLoadingWallets}
            locale={locale}
            onOpenAdd={openAdd}
            onSelectWallet={handleWalletSelect}
            selectedWallet={selectedWallet}
            wallets={wallets}
          />
        </div>

        <div className="lg:col-span-2">
          <WalletDetailPanel
            deletingId={deletingId}
            loadingTxWalletId={loadingTxWalletId}
            locale={locale}
            noTransactionsLabel={t("wallets.noTx")}
            onDeleteWallet={handleDeleteWallet}
            onEditWallet={openEdit}
            recentTransactionsLabel={t("wallets.recentTx")}
            selectHintLabel={t("wallets.selectHint")}
            selectedTxs={selectedTxs}
            wallet={selectedWalletData}
          />
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto hide-scrollbar">
          <DialogTitle>
            {editing ? t("wallets.editTitle") : t("wallets.addTitle")}
          </DialogTitle>
          <DialogDescription>
            {editing ? t("wallets.editDesc") : t("wallets.addDesc")}
          </DialogDescription>
          <form
            className="space-y-4 pt-2"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              void handleSave();
            }}
          >
            <div>
              <Label>{t("wallets.nameLabel")}</Label>
              <Input
                value={formName}
                aria-invalid={!!formErrors.name}
                onBlur={() => touchFormField("name")}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t("wallets.namePlaceholder")}
              />
              {formErrors.name && (
                <p className="mt-1 text-xs text-destructive">
                  {formErrors.name}
                </p>
              )}
            </div>
            <div>
              <Label>{t("wallets.balanceLabel")}</Label>
              <Input
                aria-invalid={!!formErrors.balance}
                inputMode="numeric"
                type="text"
                value={formBalance}
                onBlur={() => touchFormField("balance")}
                onChange={(e) => handleBalanceChange(e.target.value)}
              />
              {formErrors.balance && (
                <p className="mt-1 text-xs text-destructive">
                  {formErrors.balance}
                </p>
              )}
            </div>
            <div>
              <Label>{t("wallets.typeLabel")}</Label>
              <Select
                value={formType}
                onValueChange={(value) => setFormType(value as WalletType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(WALLET_TYPE_LABELS) as WalletType[]).map(
                    (type) => (
                      <SelectItem key={type} value={type}>
                        {WALLET_TYPE_LABELS[type][locale]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("wallets.iconLabel")}</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {WALLET_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormIcon(icon)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${formIcon === icon ? "border-primary bg-primary/10" : "border-border hover:bg-secondary"}`}
                  >
                    <WalletIcon name={icon} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>{t("wallets.colorLabel")}</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {WALLET_COLORS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setFormColor(color.class)}
                    className={`w-8 h-8 rounded-full ${color.class} ${formColor === color.class ? "ring-2 ring-offset-2 ring-primary" : ""} transition-all`}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>{t("wallets.noteLabel")}</Label>
              <Textarea
                aria-invalid={!!formErrors.note}
                value={formNote}
                onBlur={() => touchFormField("note")}
                onChange={(e) => setFormNote(e.target.value)}
                placeholder={t("wallets.notePlaceholder")}
                rows={2}
              />
              <div className="mt-1 flex items-center justify-between gap-3">
                <div>
                  {formErrors.note && (
                    <p className="text-xs text-destructive">
                      {formErrors.note}
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formNote.length}/{MAX_NOTE_LENGTH}
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => setDialogOpen(false)}
              >
                {t("dialog.cancel")}
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("dialog.save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default WalletPage;
