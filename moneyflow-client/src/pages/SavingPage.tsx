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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { SavingsWallet, useSavings } from "@/hooks/use-savings";
import { useWallets } from "@/hooks/use-wallets";
import {
  formatFormattedNumberInput,
  formatFormattedNumberValue,
  parseFormattedNumber,
} from "@/lib/formatted-number";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  CheckCircle2,
  Edit2,
  PiggyBank,
  Plus,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { format } from "date-fns";
import React, { useCallback, useMemo, useReducer, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type SavingProjection = {
  maturityDate: Date;
  savingDays: number;
  interestEarned: number;
  finalAmount: number;
};

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function toStartOfDay(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function getDayDifference(startDate: Date, endDate: Date) {
  const start = toStartOfDay(startDate).getTime();
  const end = toStartOfDay(endDate).getTime();
  if (end <= start) return 0;
  return Math.floor((end - start) / MS_PER_DAY);
}

function calculateSavingProjection(
  principal: number,
  annualRate: number,
  startDate: Date,
  termMonths: number,
): SavingProjection {
  const maturityDate = addMonths(startDate, termMonths);
  const savingDays = getDayDifference(startDate, maturityDate);
  const interestEarned =
    principal * (annualRate / 100) * (savingDays / 365);
  return {
    maturityDate,
    savingDays,
    interestEarned: Math.max(0, interestEarned),
    finalAmount: Math.max(0, principal + interestEarned),
  };
}

function formatVND(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(value));
}

function parseDateValue(value?: string) {
  if (!value) return new Date();

  const dateOnly = value.includes("T") ? value.slice(0, 10) : value;
  const match = dateOnly.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

interface FormState {
  name: string;
  deposit: string;
  rate: string;
  term: string;
  note: string;
  sourceAccountId: string;
  startDate: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  deposit: "",
  rate: "",
  term: "",
  note: "",
  sourceAccountId: "none",
  startDate: new Date().toISOString().split("T")[0],
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
  const {
    createSaving,
    deleteSaving,
    savings: wallets,
    settleSaving,
    updateSaving,
  } = useSavings();
  const { wallets: sourceWallets } = useWallets();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingWallet, setEditingWallet] = useState<SavingsWallet | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [settleId, setSettleId] = useState<string | null>(null);
  const [settleTargetAccountId, setSettleTargetAccountId] = useState("");
  const [isSettling, setIsSettling] = useState(false);
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
    dispatch({
      type: "SET_FIELD",
      field: "startDate",
      value: new Date().toISOString().split("T")[0],
    });
    setDialogOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((wallet: SavingsWallet) => {
    const start = format(parseDateValue(wallet.startDate), "yyyy-MM-dd");

    dispatch({
      type: "LOAD",
      payload: {
        name: wallet.name,
        deposit: formatFormattedNumberValue(wallet.initialDeposit).toString(),
        rate: wallet.interestRate.toString(),
        term: wallet.termMonths.toString(),
        note: wallet.note,
        sourceAccountId: wallet.sourceAccountId || "none",
        startDate: start,
      },
    });
    setEditingWallet(wallet);
    setDialogOpen(true);
  }, []);

  const openSettleDialog = useCallback(
    (wallet: SavingsWallet) => {
      const hasLinkedSource = Boolean(
        wallet.sourceAccountId &&
          sourceWallets.some((item) => item.id === wallet.sourceAccountId),
      );
      setSettleId(wallet.id);
      setSettleTargetAccountId(
        hasLinkedSource ? wallet.sourceAccountId! : (sourceWallets[0]?.id || ""),
      );
    },
    [sourceWallets],
  );

  const closeSettleDialog = useCallback(() => {
    setSettleId(null);
    setSettleTargetAccountId("");
    setIsSettling(false);
  }, []);

  const getParsedForm = () => ({
    dep: parseFormattedNumber(form.deposit) ?? 0,
    r: Number.parseFloat(form.rate),
    m: Number.parseInt(form.term, 10),
  });

  const validate = useCallback((): boolean => {
    const { dep, r, m } = getParsedForm();
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) nextErrors.name = t("validation.nameRequired");
    if (!form.deposit || Number.isNaN(dep) || dep <= 0) {
      nextErrors.deposit = t("validation.amountPositive");
    }
    if (!form.rate || Number.isNaN(r) || r <= 0) {
      nextErrors.rate = t("validation.ratePositive");
    }
    if (!form.term || Number.isNaN(m) || m <= 0) {
      nextErrors.term = t("validation.termPositive");
    }
    if (!form.startDate) {
      nextErrors.startDate = t("savings.startDateRequired");
    }

    if (!editingWallet && form.sourceAccountId !== "none") {
      const sourceWallet = sourceWallets.find((w) => w.id === form.sourceAccountId);
      if (!sourceWallet || sourceWallet.balance < dep) {
        nextErrors.deposit = t("savings.insufficientSourceBalance");
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [editingWallet, form, sourceWallets, t]);

  const handleSave = useCallback(async () => {
    if (!validate() || isSaving) return;
    const { dep, r, m } = getParsedForm();
    setIsSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        initialDeposit: dep,
        interestRate: r,
        note: form.note.trim(),
        sourceAccountId:
          form.sourceAccountId === "none" ? undefined : form.sourceAccountId,
        startDate: form.startDate,
        termMonths: m,
      };

      if (editingWallet) {
        await updateSaving(editingWallet.id, payload);
        toast({
          title: t("savings.updated"),
          description: t("savings.updatedDesc"),
        });
      } else {
        await createSaving(payload);
        toast({
          title: t("savings.added"),
          description: t("savings.addedDesc"),
        });
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: t("toast.errorTitle"),
        description: getErrorMessage(error, t("savings.saveFailedDesc")),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    createSaving,
    editingWallet,
    form,
    isSaving,
    resetForm,
    t,
    toast,
    updateSaving,
    validate,
  ]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteSaving(id);
        toast({
          title: t("savings.deleted"),
          description: t("savings.deletedDesc"),
        });
      } catch (error) {
        toast({
          title: t("toast.errorTitle"),
          description: getErrorMessage(error, t("savings.deleteFailedDesc")),
          variant: "destructive",
        });
      } finally {
        setDeleteId(null);
      }
    },
    [deleteSaving, t, toast],
  );

  const settleWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === settleId) ?? null,
    [settleId, wallets],
  );
  const hasValidLinkedSource = useMemo(
    () =>
      Boolean(
        settleWallet?.sourceAccountId &&
          sourceWallets.some((wallet) => wallet.id === settleWallet.sourceAccountId),
      ),
    [settleWallet?.sourceAccountId, sourceWallets],
  );
  const requiresSettleTargetAccount = Boolean(
    settleWallet && !hasValidLinkedSource,
  );

  const handleSettle = useCallback(async () => {
    if (!settleWallet || isSettling) return;

    if (requiresSettleTargetAccount && !settleTargetAccountId) {
      toast({
        title: t("toast.errorTitle"),
        description: t("savings.settleTargetRequired"),
        variant: "destructive",
      });
      return;
    }

    setIsSettling(true);
    try {
      await settleSaving(
        settleWallet.id,
        requiresSettleTargetAccount ? settleTargetAccountId : undefined,
      );
      toast({
        title: t("savings.settled"),
        description: t("savings.settledDesc"),
      });
      closeSettleDialog();
    } catch (error) {
      toast({
        title: t("toast.errorTitle"),
        description: getErrorMessage(error, t("savings.settleFailedDesc")),
        variant: "destructive",
      });
    } finally {
      setIsSettling(false);
    }
  }, [
    closeSettleDialog,
    isSettling,
    requiresSettleTargetAccount,
    settleSaving,
    settleTargetAccountId,
    settleWallet,
    t,
    toast,
  ]);

  const walletsWithCalc = useMemo(
    () =>
      wallets.map((wallet) => {
        const startDate = parseDateValue(wallet.startDate);
        const projection = calculateSavingProjection(
          wallet.initialDeposit,
          wallet.interestRate,
          startDate,
          wallet.termMonths,
        );
        const interestEarned =
          wallet.status === "settled"
            ? (wallet.settledInterest ?? projection.interestEarned)
            : projection.interestEarned;
        const finalAmount =
          wallet.status === "settled"
            ? (wallet.settledAmount ?? wallet.initialDeposit + interestEarned)
            : projection.finalAmount;

        return {
          ...wallet,
          finalAmount,
          interestEarned,
          maturityDate: wallet.maturityDate ?? projection.maturityDate.toISOString(),
        };
      }),
    [wallets],
  );

  const activeWallets = useMemo(
    () => walletsWithCalc.filter((wallet) => wallet.status !== "settled"),
    [walletsWithCalc],
  );
  const settledWallets = useMemo(
    () => walletsWithCalc.filter((wallet) => wallet.status === "settled"),
    [walletsWithCalc],
  );

  const { totalDeposit, totalFinal, totalInterest } = useMemo(
    () =>
      activeWallets.reduce(
        (acc, wallet) => ({
          totalDeposit: acc.totalDeposit + wallet.initialDeposit,
          totalFinal: acc.totalFinal + wallet.finalAmount,
          totalInterest: acc.totalInterest + wallet.interestEarned,
        }),
        { totalDeposit: 0, totalFinal: 0, totalInterest: 0 },
      ),
    [activeWallets],
  );

  const previewCalc = useMemo(() => {
    const dep = parseFormattedNumber(form.deposit);
    const rate = Number.parseFloat(form.rate);
    const term = Number.parseInt(form.term, 10);
    if (!form.startDate) return null;
    if (!dep || dep <= 0 || Number.isNaN(dep)) return null;
    if (!rate || rate <= 0 || Number.isNaN(rate)) return null;
    if (!term || term <= 0 || Number.isNaN(term)) return null;
    return calculateSavingProjection(dep, rate, parseDateValue(form.startDate), term);
  }, [form.deposit, form.rate, form.startDate, form.term]);

  return (
    <DashboardLayout onFabClick={openAdd}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            {t("savings.activeListTitle")}
          </h2>
          {activeWallets.length === 0 ? (
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
              {activeWallets.map((wallet) => (
                <Card key={wallet.id} className="relative group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{wallet.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {wallet.termMonths} {t("savings.monthUnit")} • {wallet.interestRate}%/{t("savings.yearUnit")}
                          {wallet.sourceAccountId && (
                            <span className="block text-xs mt-0.5 text-orange-500">
                              {t("savings.linkedSourceBadge")}
                            </span>
                          )}
                          {wallet.note && (
                            <span className="block text-xs mt-0.5">{wallet.note}</span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openSettleDialog(wallet)}
                          title={t("savings.settleAction")}
                          className="p-1.5 rounded-md hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(wallet)}
                          title={t("savings.editAction")}
                          className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(wallet.id)}
                          title={t("savings.deleteAction")}
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
                          {formatVND(wallet.initialDeposit)}đ
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-[11px] text-muted-foreground">
                          {t("savings.interestLabel")}
                        </p>
                        <p className="text-sm font-semibold text-emerald-500">
                          +{formatVND(wallet.interestEarned)}đ
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 bg-primary/5 rounded-lg p-3 border border-primary/10">
                      <p className="text-[11px] text-muted-foreground">
                        {t("savings.receivedLabel")}
                        {wallet.maturityDate && (
                          <span className="ml-1 opacity-70">
                            ({t("savings.receiveDate")}: {parseDateValue(wallet.maturityDate).toLocaleDateString("vi-VN")})
                          </span>
                        )}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {formatVND(wallet.finalAmount)}đ
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {settledWallets.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
              {t("savings.settledListTitle")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {settledWallets.map((wallet) => (
                <Card key={wallet.id} className="relative bg-muted/20 border-dashed">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-sm text-muted-foreground line-through decoration-muted-foreground/30">
                          {wallet.name}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {formatVND(wallet.finalAmount)}đ • {wallet.termMonths} {t("savings.monthUnit")}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setDeleteId(wallet.id)}
                          title={t("savings.deleteAction")}
                          className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("savings.linkedWalletLabel")}</Label>
                <Select
                  value={form.sourceAccountId}
                  onValueChange={(value) =>
                    dispatch({ type: "SET_FIELD", field: "sourceAccountId", value })
                  }
                >
                  <SelectTrigger disabled={Boolean(editingWallet)}>
                    <SelectValue placeholder={t("savings.selectPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("savings.noLinkOption")}</SelectItem>
                    {sourceWallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editingWallet && (
                  <p className="text-[10px] text-muted-foreground">
                    {t("savings.sourceLockedHint")}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t("savings.depositDateLabel")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.startDate
                        ? format(parseDateValue(form.startDate), "dd/MM/yyyy")
                        : t("savings.depositDatePlaceholder")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.startDate ? parseDateValue(form.startDate) : undefined}
                      onSelect={(date) =>
                        dispatch({
                          type: "SET_FIELD",
                          field: "startDate",
                          value: date ? format(date, "yyyy-MM-dd") : "",
                        })
                      }
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                {errors.startDate && (
                  <p className="text-xs text-destructive">{errors.startDate}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("savings.depositAmountLabel")}</Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="10,000,000"
                value={form.deposit}
                onChange={(event) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "deposit",
                    value: formatFormattedNumberInput(event.target.value),
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
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("savings.preview")}</span>
                  <span className="font-medium text-foreground">
                    {format(previewCalc.maturityDate, "dd/MM/yyyy")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("savings.depositLabel")}</span>
                  <span className="font-medium text-foreground">{form.deposit}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("savings.interestLabel")}</span>
                  <span className="font-medium text-emerald-500">
                    +{formatVND(previewCalc.interestEarned)}đ
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between text-sm">
                  <span className="font-medium text-foreground">{t("savings.receivedLabel")}</span>
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
            <Button onClick={handleSave} disabled={isSaving}>
              {t("savings.saveBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(settleId)} onOpenChange={(open) => !open && closeSettleDialog()}>
        <DialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <DialogTitle>{t("savings.settleDialogTitle")}</DialogTitle>
            <DialogDescription>
              {requiresSettleTargetAccount
                ? t("savings.settleDialogDescNoLink")
                : t("savings.settleDialogDescLinked")}
            </DialogDescription>
          </AlertDialogHeader>

          {requiresSettleTargetAccount && (
            <div className="space-y-2 py-2">
              <Label>{t("savings.settleTargetLabel")}</Label>
              <Select
                value={settleTargetAccountId}
                onValueChange={setSettleTargetAccountId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("savings.settleTargetPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {sourceWallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sourceWallets.length === 0 && (
                <p className="text-xs text-destructive">
                  {t("savings.noSettlementWallet")}
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeSettleDialog} disabled={isSettling}>
              {t("dialog.cancel")}
            </Button>
            <Button
              onClick={() => void handleSettle()}
              disabled={
                isSettling ||
                (requiresSettleTargetAccount &&
                  (!settleTargetAccountId || sourceWallets.length === 0))
              }
            >
              {t("savings.settleConfirmBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) void handleDelete(deleteId);
        }}
      />
    </DashboardLayout>
  );
};

export default SavingPage;
