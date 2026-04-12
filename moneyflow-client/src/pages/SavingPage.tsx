import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import {
  Edit2,
  PiggyBank,
  Plus,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import React, { useState } from "react";

interface SavingsWallet {
  id: string;
  name: string;
  initialDeposit: number;
  interestRate: number;
  termMonths: number;
  note: string;
  createdAt: string;
}

function calculateCompoundInterest(
  principal: number,
  annualRate: number,
  months: number,
) {
  const monthlyRate = annualRate / 12 / 100;
  const finalAmount = principal * Math.pow(1 + monthlyRate, months);
  const interestEarned = finalAmount - principal;
  return {
    finalAmount,
    interestEarned,
  };
}

function formatVND(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(value));
}

const SavingPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [wallets, setWallets] = useState<SavingsWallet[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<SavingsWallet | null>(
    null,
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [deposit, setDeposit] = useState("");
  const [rate, setRate] = useState("");
  const [term, setTerm] = useState("");
  const [note, setNote] = useState("");

  const resetForm = () => {
    setName("");
    setDeposit("");
    setRate("");
    setTerm("");
    setNote("");
    setEditingWallet(null);
    setErrors({});
  };

  const openAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (wallet: SavingsWallet) => {
    setName(wallet.name);
    setDeposit(wallet.initialDeposit.toString());
    setRate(wallet.interestRate.toString());
    setTerm(wallet.termMonths.toString());
    setNote(wallet.note);
    setEditingWallet(wallet);
    setDialogOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = t("validation.nameRequired");
    const dep = Number.parseFloat(deposit);
    if (!deposit || Number.isNaN(dep) || dep <= 0)
      e.deposit = t("validation.amountPositive");
    const r = Number.parseFloat(rate);
    if (!rate || Number.isNaN(r) || r <= 0)
      e.rate = t("validation.ratePositive");
    const m = Number.parseInt(term);
    if (!term || Number.isNaN(m) || m <= 0)
      e.term = t("validation.termPositive");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const dep = Number.parseFloat(deposit);
    const r = Number.parseFloat(rate);
    const m = Number.parseInt(term);

    if (editingWallet) {
      setWallets((prev) =>
        prev.map((w) =>
          w.id === editingWallet.id
            ? {
                ...w,
                name,
                initialDeposit: dep,
                interestRate: r,
                termMonths: m,
                note,
              }
            : w,
        ),
      );
      toast({
        title: t("savings.updated"),
        description: t("savings.updatedDesc"),
      });
    } else {
      const newWallet: SavingsWallet = {
        id: crypto.randomUUID(),
        name: name.trim(),
        initialDeposit: dep,
        interestRate: r,
        termMonths: m,
        note: note.trim(),
        createdAt: new Date().toISOString(),
      };
      setWallets((prev) => [...prev, newWallet]);
      toast({
        title: t("savings.added"),
        description: t("savings.addedDesc"),
      });
    }
  };
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const handleDelete = (id: string) => {
    setWallets((prev) => prev.filter((w) => w.id !== id));
    toast({
      title: t("savings.deleted"),
      description: t("savings.deletedDesc"),
    });
    setDeleteId(null);
  };
  const totalDeposit = wallets.reduce((s, w) => s + w.initialDeposit, 0);
  const totalFinal = wallets.reduce(
    (s, w) =>
      s +
      calculateCompoundInterest(w.initialDeposit, w.interestRate, w.termMonths)
        .finalAmount,
    0,
  );
  const totalInterest = totalFinal - totalDeposit;
  return (
    <DashboardLayout onFabClick={openAdd}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {t("savings.pageTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("savings.pageSubtitle")}
          </p>
        </div>
        <Button onClick={openAdd} className="hidden lg:flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t("savings.addWallet")}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("savings.totalDeposit")}
                </p>
                <p className="text-lg font-bold text-foreground">
                  {formatVND(totalDeposit)}đ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("savings.totalInterest")}
                </p>
                <p className="text-lg font-bold text-emerald-500">
                  +{formatVND(totalInterest)}đ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("savings.totalReceived")}
                </p>
                <p className="text-lg font-bold text-foreground">
                  {formatVND(totalFinal)}đ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallets List */}
      {wallets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <PiggyBank className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {t("savings.emptyTitle")}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("savings.emptyDesc")}
            </p>
            <Button onClick={openAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              {t("savings.addFirst")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wallets.map((w) => {
            const { finalAmount, interestEarned } = calculateCompoundInterest(
              w.initialDeposit,
              w.interestRate,
              w.termMonths,
            );
            return (
              <Card key={w.id} className="relative group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{w.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {w.termMonths} {t("savings.monthUnit")} •{" "}
                        {w.interestRate}%/{t("savings.yearUnit")}
                        {w.note && (
                          <span className="block text-xs mt-0.5">{w.note}</span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(w)}
                        className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(w.id)}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-[11px] text-muted-foreground">
                        {t("savings.depositLabel")}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatVND(w.initialDeposit)}đ
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-[11px] text-muted-foreground">
                        {t("savings.interestLabel")}
                      </p>
                      <p className="text-sm font-semibold text-emerald-500">
                        +{formatVND(interestEarned)}đ
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 bg-primary/5 rounded-lg p-3 border border-primary/10">
                    <p className="text-[11px] text-muted-foreground">
                      {t("savings.receivedLabel")}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {formatVND(finalAmount)}đ
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <AlertDialogHeader>
            <DialogTitle>
              {editingWallet ? t("savings.editTitle") : t("savings.addTitle")}
            </DialogTitle>
            <DialogDescription>
              {editingWallet ? t("savings.editDesc") : t("savings.addDesc")}
            </DialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("savings.nameLabel")}</Label>
              <Input
                placeholder={t("savings.namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("savings.depositAmountLabel")}</Label>
              <Input
                type="number"
                placeholder="10,000,000"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                className={errors.deposit ? "border-destructive" : ""}
              />
              {errors.deposit && (
                <p className="text-xs text-destructive">{errors.deposit}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("savings.rateLabel")}</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="5.5"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className={errors.rate ? "border-destructive" : ""}
                />
                {errors.rate && (
                  <p className="text-xs text-destructive">{errors.rate}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t("savings.termLabel")}</Label>
                <Input
                  type="number"
                  placeholder="12"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className={errors.term ? "border-destructive" : ""}
                />
                {errors.term && (
                  <p className="text-xs text-destructive">{errors.term}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("savings.noteLabel")}</Label>
              <Input
                placeholder={t("savings.notePlaceholder")}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {Number.parseFloat(deposit) > 0 &&
              Number.parseFloat(rate) > 0 &&
              Number.parseInt(term) > 0 && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 border">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("savings.preview")}
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("savings.depositLabel")}
                    </span>
                    <span className="font-medium text-foreground">
                      {formatVND(Number.parseFloat(deposit))}đ
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("savings.interestLabel")}
                    </span>
                    <span className="font-medium text-emerald-500">
                      +
                      {formatVND(
                        calculateCompoundInterest(
                          Number.parseFloat(deposit),
                          Number.parseFloat(rate),
                          Number.parseInt(term),
                        ).interestEarned,
                      )}
                      đ
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {t("savings.receivedLabel")}
                    </span>
                    <span className="font-bold text-primary">
                      {formatVND(
                        calculateCompoundInterest(
                          Number.parseFloat(deposit),
                          Number.parseFloat(rate),
                          Number.parseInt(term),
                        ).finalAmount,
                      )}
                      đ
                    </span>
                  </div>
                </div>
              )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
            >
              {t("dialog.cancel")}
            </Button>
            <Button onClick={handleSave}>{t("savings.saveBtn")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
      />
    </DashboardLayout>
  );
};

export default SavingPage;
