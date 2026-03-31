import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import WalletDetailPanel from "@/components/wallets/WalletDetailPanel";
import WalletFormDialog from "@/components/wallets/WalletFormDialog";
import WalletListPanel from "@/components/wallets/WalletListPanel";
import { useLanguage } from "@/hooks/use-language";
import { useWalletForm } from "@/hooks/use-wallet-form";
import { useWalletTransactions } from "@/hooks/use-wallet-transactions";
import { useWallets } from "@/hooks/use-wallets";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { fmtVND } from "@/lib/format";
import { Wallet } from "@/types/wallet";
import { Plus } from "lucide-react";
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
    maxNoteLength,
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

      {dialogOpen && (
        <WalletFormDialog
          formBalance={formBalance}
          formColor={formColor}
          formErrors={formErrors}
          formIcon={formIcon}
          formName={formName}
          formNote={formNote}
          formType={formType}
          isEditing={!!editing}
          isSaving={isSaving}
          maxNoteLength={maxNoteLength}
          onBalanceChange={handleBalanceChange}
          onOpenChange={setDialogOpen}
          onSave={() => {
            void handleSave();
          }}
          open={dialogOpen}
          setFormColor={setFormColor}
          setFormIcon={setFormIcon}
          setFormName={setFormName}
          setFormNote={setFormNote}
          setFormType={setFormType}
          touchFormField={touchFormField}
        />
      )}
    </DashboardLayout>
  );
};

export default WalletPage;
