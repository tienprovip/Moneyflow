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
  formatFormattedNumberInput,
  formatFormattedNumberValue,
  parseFormattedNumber,
} from "@/lib/formatted-number";
import {
  Edit2,
  PiggyBank,
  Plus,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import React, { useCallback, useMemo, useReducer, useState } from "react";

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
  return { finalAmount, interestEarned: finalAmount - principal };
}

function formatVND(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(value));
}

interface FormState {
  name: string;
  deposit: string;
  rate: string;
  term: string;
  note: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  deposit: "",
  rate: "",
  term: "",
  note: "",
};

type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: string }
  | { type: "RESET" }
  | { type: "LOAD"; payload: FormState };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return INITIAL_FORM;
    case "LOAD":
      return action.payload;
    default:
      return state;
  }
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
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, dispatch] = useReducer(formReducer, INITIAL_FORM);

  const setField =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      dispatch({ type: "SET_FIELD", field, value: e.target.value });

  const resetForm = useCallback(() => {
    dispatch({ type: "RESET" });
    setEditingWallet(null);
    setErrors({});
  }, []);

  const openAdd = useCallback(() => {
    resetForm();
    setDialogOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((wallet: SavingsWallet) => {
    dispatch({
      type: "LOAD",
      payload: {
        name: wallet.name,
        deposit: formatFormattedNumberValue(wallet.initialDeposit).toString(),
        rate: wallet.interestRate.toString(),
        term: wallet.termMonths.toString(),
        note: wallet.note,
      },
    });
    setEditingWallet(wallet);
    setDialogOpen(true);
  }, []);

  const getParsedForm = () => ({
    dep: parseFormattedNumber(form.deposit) ?? 0,
    r: Number.parseFloat(form.rate),
    m: Number.parseInt(form.term),
  });

  const validate = (): boolean => {
    const { dep, r, m } = getParsedForm();
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = t("validation.nameRequired");
    if (!form.deposit || Number.isNaN(dep) || dep <= 0)
      e.deposit = t("validation.amountPositive");
    if (!form.rate || Number.isNaN(r) || r <= 0)
      e.rate = t("validation.ratePositive");
    if (!form.term || Number.isNaN(m) || m <= 0)
      e.term = t("validation.termPositive");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = useCallback(() => {
    if (!validate()) return;
    const { dep, r, m } = getParsedForm();

    if (editingWallet) {
      setWallets((prev) =>
        prev.map((w) =>
          w.id === editingWallet.id
            ? {
                ...w,
                name: form.name,
                initialDeposit: dep,
                interestRate: r,
                termMonths: m,
                note: form.note,
              }
            : w,
        ),
      );
      toast({
        title: t("savings.updated"),
        description: t("savings.updatedDesc"),
      });
    } else {
      setWallets((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: form.name.trim(),
          initialDeposit: dep,
          interestRate: r,
          termMonths: m,
          note: form.note.trim(),
          createdAt: new Date().toISOString(),
        },
      ]);
      toast({ title: t("savings.added"), description: t("savings.addedDesc") });
    }

    setDialogOpen(false);
    resetForm();
  }, [editingWallet, form, t, toast, resetForm]);

  const handleDelete = useCallback(
    (id: string) => {
      setWallets((prev) => prev.filter((w) => w.id !== id));
      toast({
        title: t("savings.deleted"),
        description: t("savings.deletedDesc"),
      });
      setDeleteId(null);
    },
    [t, toast],
  );

  const walletsWithCalc = useMemo(
    () =>
      wallets.map((w) => ({
        ...w,
        ...calculateCompoundInterest(
          w.initialDeposit,
          w.interestRate,
          w.termMonths,
        ),
      })),
    [wallets],
  );

  const { totalDeposit, totalFinal, totalInterest } = useMemo(
    () =>
      walletsWithCalc.reduce(
        (acc, w) => ({
          totalDeposit: acc.totalDeposit + w.initialDeposit,
          totalFinal: acc.totalFinal + w.finalAmount,
          totalInterest: acc.totalInterest + w.interestEarned,
        }),
        { totalDeposit: 0, totalFinal: 0, totalInterest: 0 },
      ),
    [walletsWithCalc],
  );

  const previewCalc = useMemo(() => {
    const dep = parseFormattedNumber(form.deposit);
    const r = Number.parseFloat(form.rate);
    const m = Number.parseInt(form.term);
    if (dep > 0 && r > 0 && m > 0) {
      return calculateCompoundInterest(dep, r, m);
    }
    return null;
  }, [form.deposit, form.rate, form.term]);

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
      {walletsWithCalc.length === 0 ? (
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
          {walletsWithCalc.map((w) => (
            <Card key={w.id} className="relative group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{w.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {w.termMonths} {t("savings.monthUnit")} • {w.interestRate}
                      %/{t("savings.yearUnit")}
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
                      +{formatVND(w.interestEarned)}đ
                    </p>
                  </div>
                </div>
                <div className="mt-3 bg-primary/5 rounded-lg p-3 border border-primary/10">
                  <p className="text-[11px] text-muted-foreground">
                    {t("savings.receivedLabel")}
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {formatVND(w.finalAmount)}đ
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
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
                value={form.name}
                onChange={setField("name")}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("savings.depositAmountLabel")}</Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="10,000,000"
                value={form.deposit}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "deposit",
                    value: formatFormattedNumberInput(e.target.value),
                  })
                }
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
                  value={form.rate}
                  onChange={setField("rate")}
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
                  value={form.term}
                  onChange={setField("term")}
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
                value={form.note}
                onChange={setField("note")}
              />
            </div>

            {previewCalc && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 border">
                <p className="text-xs font-medium text-muted-foreground">
                  {t("savings.preview")}
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("savings.depositLabel")}
                  </span>
                  <span className="font-medium text-foreground">
                    {form.deposit}đ
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("savings.interestLabel")}
                  </span>
                  <span className="font-medium text-emerald-500">
                    +{formatVND(previewCalc.interestEarned)}đ
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {t("savings.receivedLabel")}
                  </span>
                  <span className="font-bold text-primary">
                    {formatVND(previewCalc.finalAmount)}đ
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
