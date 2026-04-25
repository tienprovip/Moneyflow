import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import { fmtVND } from "@/lib/format";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { format } from "date-fns";
import { CalendarIcon, AlertTriangle, Wallet } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { GoldType, GOLD_TYPE_OPTIONS } from "@/types/gold";
import type { GoldHolding } from "@/types/gold";

export type { GoldHolding };

export interface WalletOption {
  id: string;
  name: string;
  balance: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: GoldHolding | null;
  presetType?: GoldType | null;
  marketPrices: Record<string, { buy: number; sell: number }>;
  /** Danh sách ví (bao gồm balance để validate) */
  wallets: WalletOption[];
  onSave: (data: {
    type: GoldType;
    quantity: number;
    purchasePrice: number;
    purchaseDate: string;
    notes?: string;
    sourceAccountId?: string;
  }) => Promise<void>;
}

export const GoldDialog = ({
  open,
  onOpenChange,
  editing,
  presetType,
  marketPrices,
  wallets,
  onSave,
}: Props) => {
  const { t } = useLanguage();
  const [formType, setFormType] = useState<GoldType>(GoldType.KGB);
  const [formQty, setFormQty] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDate, setFormDate] = useState<Date | undefined>(new Date());
  const [formNotes, setFormNotes] = useState("");
  const [formWalletId, setFormWalletId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        setFormType(editing.type);
        setFormQty(editing.quantity.toString());
        setFormPrice(editing.purchasePrice.toString());
        setFormDate(new Date(editing.purchaseDate));
        setFormNotes(editing.notes || "");
        setFormWalletId("");
      } else {
        const type = presetType || GoldType.KGB;
        setFormType(type);
        setFormQty("");
        setFormPrice(marketPrices[type]?.sell?.toString() || "");
        setFormDate(new Date());
        setFormNotes("");
        setFormWalletId("");
      }
      setErrors({});
    }
  }, [open, editing, presetType, marketPrices]);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  // ─── Derived values ─────────────────────────────────────────────────────────
  const totalCost = useMemo(() => {
    const qty = Number(formQty);
    const price = Number(formPrice);
    if (!qty || !price || isNaN(qty) || isNaN(price)) return 0;
    return Math.round(qty * price);
  }, [formQty, formPrice]);

  const selectedWallet = useMemo(
    () => wallets.find((w) => w.id === formWalletId) ?? null,
    [wallets, formWalletId],
  );

  const isInsufficientBalance = useMemo(() => {
    if (!selectedWallet || totalCost <= 0) return false;
    return selectedWallet.balance < totalCost;
  }, [selectedWallet, totalCost]);

  // ─── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    const qty = Number(formQty);
    if (!formQty || Number.isNaN(qty) || qty <= 0) e.qty = t("gold.qtyError");
    const price = Number(formPrice);
    if (!formPrice || Number.isNaN(price) || price <= 0)
      e.price = t("gold.priceError");

    // Validate số dư ví nếu đã chọn ví
    if (formWalletId && selectedWallet && totalCost > 0) {
      if (selectedWallet.balance < totalCost) {
        e.wallet = t("account.insufficientSourceBalance");
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        type: formType,
        quantity: Number(formQty),
        purchasePrice: Number(formPrice),
        purchaseDate: formDate
          ? format(formDate, "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        notes: formNotes.trim() || undefined,
        sourceAccountId: formWalletId || undefined,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-110">
        <DialogHeader>
          <DialogTitle>
            {editing ? t("gold.editTitle") : t("gold.addTitle")}
          </DialogTitle>
          <DialogDescription>
            {editing ? t("gold.editDesc") : t("gold.addDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            {/* Loại vàng — chỉ cho chọn khi tạo mới */}
            <div className="space-y-1.5">
              <Label>{t("gold.typeCol")}</Label>
              <Select
                value={formType}
                onValueChange={(v) => {
                  const newType = v as GoldType;
                  setFormType(newType);
                  if (!editing) {
                    setFormPrice(marketPrices[newType]?.sell?.toString() || "");
                  }
                }}
                disabled={!!editing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOLD_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                {t("gold.qtyCol")} ({t("gold.unit")})
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={formQty}
                onChange={(e) => setFormQty(e.target.value)}
                min={0}
                step={0.1}
              />
              {errors.qty && (
                <p className="text-xs text-destructive">{errors.qty}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("gold.purchasePrice")} (VND)</Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={formPrice ? Number(formPrice).toLocaleString("vi-VN") : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setFormPrice(raw);
                }}
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>{t("gold.purchaseDate")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 w-4 h-4" />
                    {formDate
                      ? format(formDate, "dd/MM/yyyy")
                      : t("dialog.datePlaceholder")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formDate}
                    onSelect={setFormDate}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Ví nguồn — optional, chỉ khi tạo mới */}
          {!editing && (
            <div className="space-y-1.5">
              <Label>
                {t("gold.sourceWallet")}{" "}
                <span className="text-muted-foreground text-xs">
                  ({t("dialog.optional")})
                </span>
              </Label>
              <Select
                value={formWalletId}
                onValueChange={setFormWalletId}
              >
                <SelectTrigger
                  className={cn(
                    errors.wallet && "border-destructive focus:ring-destructive",
                  )}
                >
                  <SelectValue placeholder={t("gold.sourceWalletPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      <span className="flex items-center justify-between w-full gap-3">
                        <span className="flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
                          {w.name}
                        </span>
                        <span className={cn(
                          "text-xs tabular-nums ml-auto",
                          w.balance <= 0 ? "text-destructive" : "text-muted-foreground",
                        )}>
                          {fmtVND(w.balance)}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Balance preview khi đã chọn ví */}
              {selectedWallet && totalCost > 0 && (
                <div
                  className={cn(
                    "flex items-start gap-2 p-2.5 rounded-lg text-xs",
                    isInsufficientBalance
                      ? "bg-destructive/10 text-destructive"
                      : "bg-secondary/60 text-muted-foreground",
                  )}
                >
                  {isInsufficientBalance ? (
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  ) : (
                    <Wallet className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  )}
                  <div className="space-y-0.5">
                    <div className="flex gap-3">
                      <span>{t("gold.walletBalance")}:</span>
                      <span className="font-medium tabular-nums">
                        {fmtVND(selectedWallet.balance)}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <span>{t("gold.totalCost")}:</span>
                      <span className="font-medium tabular-nums">
                        {fmtVND(totalCost)}
                      </span>
                    </div>
                    {!isInsufficientBalance && (
                      <div className="flex gap-3">
                        <span>{t("gold.remaining")}:</span>
                        <span className="font-semibold tabular-nums text-foreground">
                          {fmtVND(selectedWallet.balance - totalCost)}
                        </span>
                      </div>
                    )}
                    {isInsufficientBalance && (
                      <p className="font-medium">
                        {t("gold.insufficientHint")}{" "}
                        <span className="tabular-nums">
                          {fmtVND(totalCost - selectedWallet.balance)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {errors.wallet && (
                <p className="text-xs text-destructive">{errors.wallet}</p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>{t("dialog.notes")}</Label>
            <Input
              placeholder={t("dialog.notesPlaceholder")}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="mt-2"
          >
            {t("dialog.cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || isInsufficientBalance}
          >
            {saving
              ? t("dialog.saving")
              : editing
                ? t("dialog.update")
                : t("gold.saveHolding")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
