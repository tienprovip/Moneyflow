import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type CategoryOption,
  matchesCategoryOption,
} from "@/hooks/use-categories";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import {
  formatFormattedNumberInput,
  formatFormattedNumberValue,
  parseFormattedNumber,
} from "@/lib/formatted-number";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import type { Transaction, TransactionFormValues } from "@/types/transaction";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: TransactionFormValues) => Promise<void> | void;
  editingTransaction: Transaction | null;
  wallets: { id: string; name: string }[];
  allCategories?: CategoryOption[];
}

const AddTransactionDialog = memo(function AddTransactionDialog({
  open,
  onOpenChange,
  onSave,
  editingTransaction,
  wallets,
  allCategories,
}: Props) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState("");
  const [walletId, setWalletId] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = useMemo(() => allCategories ?? [], [allCategories]);
  const visibleCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type],
  );

  const isEdit = !!editingTransaction;

  useEffect(() => {
    if (!open) return;

    if (editingTransaction) {
      const matchedCategory = categories.find((option) =>
        matchesCategoryOption(option, editingTransaction.category),
      );
      const matchedWallet = wallets.find(
        (wallet) => wallet.id === editingTransaction.walletId,
      );

      setName(editingTransaction.name);
      setAmount(formatFormattedNumberValue(editingTransaction.amount));
      setType(editingTransaction.type);
      setCategory(matchedCategory?.value || "");
      setDate(new Date(editingTransaction.date));
      setNotes(
        editingTransaction.notes || editingTransaction.description || "",
      );
      setWalletId(matchedWallet?.id || "");
    } else {
      setName("");
      setAmount("");
      setType("expense");
      setCategory("");
      setDate(new Date());
      setNotes("");
      setWalletId(wallets[0]?.id || "");
    }
    setErrors({});
  }, [categories, editingTransaction, open, wallets]);

  const validate = useCallback(() => {
    const nextErrors: Record<string, string> = {};
    const num = parseFormattedNumber(amount);
    if (!amount || num === null || num <= 0)
      nextErrors.amount = t("validation.amountPositive");
    if (!category) nextErrors.category = t("validation.categoryRequired");
    if (!walletId) nextErrors.walletId = t("dialog.walletPlaceholder");
    if (!name.trim()) nextErrors.name = t("validation.nameRequired");
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [amount, category, name, t, walletId]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;

    const parsedAmount = parseFormattedNumber(amount);
    if (parsedAmount === null || parsedAmount <= 0) return;

    setSaving(true);

    try {
      await onSave({
        name: name.trim(),
        description: notes.trim() || name.trim(),
        amount: parsedAmount,
        type,
        category,
        date: date
          ? format(date, "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        notes,
        walletId,
      });

      onOpenChange(false);
      toast({
        title: isEdit ? t("toast.updated") : t("toast.added"),
        description: `"${name.trim()}" ${isEdit ? t("toast.updatedDesc") : t("toast.addedDesc")}`,
      });
    } catch {
      return;
    } finally {
      setSaving(false);
    }
  }, [
    amount,
    date,
    isEdit,
    name,
    notes,
    onOpenChange,
    onSave,
    t,
    type,
    validate,
    walletId,
    category,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("dialog.editTitle") : t("dialog.addTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t("dialog.editDesc") : t("dialog.addDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-name">{t("dialog.name")}</Label>
            <Input
              id="tx-name"
              placeholder={t("dialog.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Amount + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tx-amount">{t("dialog.amount")}</Label>
              <Input
                id="tx-amount"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={(e) =>
                  setAmount(formatFormattedNumberInput(e.target.value))
                }
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>{t("dialog.type")}</Label>
              <Select
                value={type}
                onValueChange={(v) => {
                  const nextType = v as "income" | "expense";
                  const nextCategories = categories.filter(
                    (category) => category.type === nextType,
                  );
                  const currentCategoryStillVisible =
                    !category ||
                    nextCategories.some(
                      (item) => item.value === category,
                    );

                  setType(nextType);
                  if (!currentCategoryStillVisible) {
                    setCategory("");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">{t("filter.income")}</SelectItem>
                  <SelectItem value="expense">{t("filter.expense")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("dialog.category")}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("dialog.categoryPlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {visibleCategories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>{t("dialog.date")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 w-4 h-4" />
                    {date
                      ? format(date, "dd/MM/yyyy")
                      : t("dialog.datePlaceholder")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Wallet */}
          <div className="space-y-1.5">
            <Label>{t("dialog.wallet")}</Label>
            <Select value={walletId} onValueChange={setWalletId}>
              <SelectTrigger>
                <SelectValue placeholder={t("dialog.walletPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.walletId && (
              <p className="text-xs text-destructive">{errors.walletId}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-notes">{t("dialog.notes")}</Label>
            <Textarea
              id="tx-notes"
              placeholder={t("dialog.notesPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="mt-3.5 md:mt-0"
          >
            {t("dialog.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving
              ? t("dialog.saving")
              : isEdit
                ? t("dialog.update")
                : t("dialog.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default AddTransactionDialog;
