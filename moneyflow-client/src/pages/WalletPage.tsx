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
import {
  MAX_WALLET_NOTE_LENGTH,
  useWalletForm,
} from "@/hooks/use-wallet-form";
import { useWalletTransactions } from "@/hooks/use-wallet-transactions";
import { useWallets } from "@/hooks/use-wallets";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { fmtVND } from "@/lib/format";
import {
  Wallet,
  WALLET_COLORS,
  WALLET_ICONS,
  WALLET_TYPE_LABELS,
  WalletType,
} from "@/types/wallet";
import { Loader2, Plus } from "lucide-react";
import { useCallback, useState } from "react";

const WalletPage = () => {
  const { t, locale } = useLanguage();
  const { toast } = useToast();
  const {
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
  } = useWallets();
  const {
    loadingTxWalletId,
    removeTransactionsForWallet,
    selectedTxs,
    setTransactionsForWallet,
  } = useWalletTransactions(selectedWallet);
  const {
    formBalance,
    formColor,
    formErrors,
    formIcon,
    formName,
    formNote,
    formType,
    handleBalanceChange,
    populateForm,
    resetForm,
    setFormColor,
    setFormIcon,
    setFormName,
    setFormNote,
    setFormType,
    touchFormField,
    validateForm,
  } = useWalletForm();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Wallet | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openAdd = useCallback(() => {
    setEditing(null);
    resetForm();
    setDialogOpen(true);
  }, [resetForm]);

  const openEdit = useCallback(
    (wallet: Wallet) => {
      setEditing(wallet);
      populateForm(wallet);
      setDialogOpen(true);
    },
    [populateForm],
  );

  const handleWalletSelect = useCallback(
    (walletId: string) => {
      selectWallet(walletId);
    },
    [selectWallet],
  );

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    const values = validateForm();
    if (!values) return;

    setIsSaving(true);

    try {
      if (editing) {
        await updateWallet(editing.id, values);

        toast({
          title: t("wallets.updated"),
          description: t("wallets.updatedDesc"),
        });
      } else {
        const newWallet = await createWallet(values);
        setTransactionsForWallet(newWallet.id, []);

        toast({
          title: t("wallets.added"),
          description: t("wallets.addedDesc"),
        });
      }

      setDialogOpen(false);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to save wallet."),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    createWallet,
    editing,
    isSaving,
    setTransactionsForWallet,
    t,
    toast,
    updateWallet,
    validateForm,
  ]);

  const handleDelete = useCallback(
    async (walletId: string) => {
      try {
        const deleted = await deleteWallet(walletId);
        if (!deleted) return;

        removeTransactionsForWallet(walletId);

        toast({
          title: t("wallets.deleted"),
          description: t("wallets.deletedDesc"),
        });
      } catch (error: unknown) {
        toast({
          title: "Error",
          description: getErrorMessage(error, "Failed to delete wallet."),
          variant: "destructive",
        });
      }
    },
    [deleteWallet, removeTransactionsForWallet, t, toast],
  );

  const handleDeleteWallet = useCallback(
    (walletId: string) => {
      void handleDelete(walletId);
    },
    [handleDelete],
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
                  {formNote.length}/{MAX_WALLET_NOTE_LENGTH}
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
