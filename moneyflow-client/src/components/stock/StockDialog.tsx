import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, AlertTriangle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useLanguage } from "@/hooks/use-language";
import { fmtVND } from "@/lib/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StockPosition } from "@/types/stock";

export interface WalletOption {
  id: string;
  name: string;
  balance: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: StockPosition | null;
  wallets: WalletOption[];
  onSave: (data: {
    symbol: string;
    quantity: number;
    buyPrice: number;
    buyDate: string;
    sourceAccountId?: string;
  }) => Promise<void>;
}

export function StockDialog({ open, onOpenChange, editing, wallets, onSave }: Props) {
  const { t } = useLanguage();
  const [formSymbol, setFormSymbol] = useState("");
  const [formQty, setFormQty] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDate, setFormDate] = useState<Date | undefined>(new Date());
  const [formWalletId, setFormWalletId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        setFormSymbol(editing.symbol);
        setFormQty("");
        setFormPrice(editing.currentPrice.toString());
        setFormDate(new Date());
        setFormWalletId("");
      } else {
        setFormSymbol("");
        setFormQty("");
        setFormPrice("");
        setFormDate(new Date());
        setFormWalletId("");
      }
      setErrors({});
    }
  }, [open, editing]);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

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

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formSymbol.trim()) e.symbol = t("stocks.errSymbol");
    
    const qty = Number(formQty);
    if (!formQty || Number.isNaN(qty) || qty <= 0) e.qty = t("stocks.errQty");
    
    const price = Number(formPrice);
    if (!formPrice || Number.isNaN(price) || price <= 0) e.price = t("stocks.errPrice");

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
        symbol: formSymbol.toUpperCase().trim(),
        quantity: Number(formQty),
        buyPrice: Number(formPrice),
        buyDate: formDate
          ? format(formDate, "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        sourceAccountId: formWalletId || undefined,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-110 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? t("stocks.buyMoreTitle") : t("stocks.addTitle")}
          </DialogTitle>
          <DialogDescription>
            {editing ? t("stocks.buyMoreDesc") : t("stocks.addDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label>{t("stocks.symbolLabel")}</Label>
            <Input
              placeholder="VD: VNM"
              value={formSymbol}
              onChange={(e) => setFormSymbol(e.target.value)}
              disabled={!!editing}
              className={errors.symbol ? "border-destructive" : ""}
            />
            {errors.symbol && (
              <p className="text-xs text-destructive">{errors.symbol}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("stocks.qtyLabel")}</Label>
              <Input
                type="number"
                placeholder="0"
                value={formQty}
                onChange={(e) => setFormQty(e.target.value)}
                min={1}
                className={errors.qty ? "border-destructive" : ""}
              />
              {errors.qty && (
                <p className="text-xs text-destructive">{errors.qty}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("stocks.avgPriceLabel")}</Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={formPrice ? Number(formPrice).toLocaleString("vi-VN") : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setFormPrice(raw);
                }}
                className={errors.price ? "border-destructive" : ""}
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("stocks.purchaseDate")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
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
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Ví nguồn — optional */}
          <div className="space-y-2">
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
                    <p className="font-medium mt-1">
                      {t("gold.insufficientHint")} {" "}
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

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("dialog.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving || isInsufficientBalance}>
            {saving
              ? t("dialog.saving")
              : editing
                ? t("stocks.buyMoreSubmit")
                : t("dialog.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
