import { useEffect, useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { ALL_CATEGORIES, type Transaction } from "@/types/transaction";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Omit<Transaction, "id" | "status">) => void;
  editingTransaction: Transaction | null;
  wallets: { id: string; name: string }[];
  allCategories?: string[];
  onAddCategory?: (cat: string) => void;
}

const AddTransactionDialog = ({
  open,
  onOpenChange,
  onSave,
  editingTransaction,
  wallets,
  allCategories,
  onAddCategory,
}: Props) => {
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
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const categories = allCategories || ALL_CATEGORIES;

  const isEdit = !!editingTransaction;

  const translateCategory = (cat: string) => {
    const key = `cat.${cat}` as any;
    const result = t(key);
    return result === key ? cat : result;
  };

  useEffect(() => {
    if (editingTransaction) {
      setName(editingTransaction.name);
      setAmount(String(editingTransaction.amount));
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setDate(new Date(editingTransaction.date));
      setNotes(
        editingTransaction.notes || editingTransaction.description || "",
      );
      setWalletId(editingTransaction.walletId || "");
    } else {
      setName("");
      setAmount("");
      setType("expense");
      setCategory("");
      setDate(new Date());
      setNotes("");
      setWalletId("");
    }
    setErrors({});
    setShowNewCategory(false);
    setNewCategoryName("");
  }, [editingTransaction, open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = t("validation.nameRequired");
    const num = Number(amount);
    if (!amount || Number.isNaN(num) || num <= 0)
      e.amount = t("validation.amountPositive");
    if (!category) e.category = t("validation.categoryRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    onSave({
      name: name.trim(),
      description: notes.trim() || name.trim(),
      amount: Number(amount),
      type,
      category,
      date: date
        ? format(date, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      notes,
      walletId: walletId || undefined,
    });
    setSaving(false);
    onOpenChange(false);
    toast({
      title: isEdit ? t("toast.updated") : t("toast.added"),
      description: `"${name.trim()}" ${isEdit ? t("toast.updatedDesc") : t("toast.addedDesc")}`,
    });
  };

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
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={0}
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>{t("dialog.type")}</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as "income" | "expense")}
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
              {showNewCategory ? (
                <div className="flex gap-1.5">
                  <Input
                    placeholder={t("dialog.newCategoryPlaceholder")}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const trimmed = newCategoryName.trim();
                        if (trimmed && !categories.includes(trimmed)) {
                          onAddCategory?.(trimmed);
                          setCategory(trimmed);
                        } else if (trimmed) {
                          setCategory(trimmed);
                        }
                        setNewCategoryName("");
                        setShowNewCategory(false);
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => {
                      const trimmed = newCategoryName.trim();
                      if (trimmed && !categories.includes(trimmed)) {
                        onAddCategory?.(trimmed);
                        setCategory(trimmed);
                      } else if (trimmed) {
                        setCategory(trimmed);
                      }
                      setNewCategoryName("");
                      setShowNewCategory(false);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="flex-1">
                      <SelectValue
                        placeholder={t("dialog.categoryPlaceholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {translateCategory(c)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => setShowNewCategory(true)}
                    title={t("dialog.newCategory")}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
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
            className="mt-3.5"
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
};

export default AddTransactionDialog;
