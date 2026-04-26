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
import { CalendarIcon, Wallet } from "lucide-react";
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
import type { WalletOption } from "./StockDialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: StockPosition | null;
  wallets: WalletOption[];
  onSave: (data: {
    stockId: string;
    quantity: number;
    sellPrice: number;
    sellDate: string;
    sellAccountId: string;
  }) => Promise<void>;
}

export function SellStockDialog({ open, onOpenChange, stock, wallets, onSave }: Props) {
  const { t } = useLanguage();
  const [formQty, setFormQty] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDate, setFormDate] = useState<Date | undefined>(new Date());
  const [formWalletId, setFormWalletId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && stock) {
      setFormQty(stock.quantity.toString());
      setFormPrice(stock.currentPrice.toString());
      setFormDate(new Date());
      setFormWalletId("");
      setErrors({});
    }
  }, [open, stock]);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  const totalRevenue = useMemo(() => {
    const qty = Number(formQty);
    const price = Number(formPrice);
    if (!qty || !price || isNaN(qty) || isNaN(price)) return 0;
    return Math.round(qty * price);
  }, [formQty, formPrice]);

  const validate = () => {
    const e: Record<string, string> = {};
    
    const qty = Number(formQty);
    if (!formQty || Number.isNaN(qty) || qty <= 0) {
      e.qty = t("stocks.errQty");
    } else if (stock && qty > stock.quantity) {
      e.qty = t("stocks.sellQtyExceed");
    }
    
    const price = Number(formPrice);
    if (!formPrice || Number.isNaN(price) || price <= 0) e.price = t("stocks.errPrice");

    if (!formWalletId) {
      e.wallet = t("gold.sellWalletRequired");
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !stock) return;
    setSaving(true);
    
    try {
      await onSave({
        stockId: stock.id,
        quantity: Number(formQty),
        sellPrice: Number(formPrice),
        sellDate: formDate
          ? format(formDate, "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        sellAccountId: formWalletId,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  if (!stock) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-110">
        <DialogHeader>
          <DialogTitle>
            {t("stocks.sellTitle")} - {stock.symbol}
          </DialogTitle>
          <DialogDescription>
            {t("stocks.sellDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("stocks.qtyLabel")}</Label>
              <Input
                type="number"
                placeholder="0"
                value={formQty}
                onChange={(e) => setFormQty(e.target.value)}
                min={1}
                max={stock.quantity}
                className={errors.qty ? "border-destructive" : ""}
              />
              <p className="text-xs text-muted-foreground">
                Tối đa: {stock.quantity.toLocaleString("vi-VN")}
              </p>
              {errors.qty && (
                <p className="text-xs text-destructive">{errors.qty}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("stocks.sellPriceLabel")}</Label>
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
            <Label>{t("stocks.sellDate")}</Label>
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

          {/* Ví nhận tiền */}
          <div className="space-y-2">
            <Label>{t("gold.sellWallet")}</Label>
            <Select
              value={formWalletId}
              onValueChange={setFormWalletId}
            >
              <SelectTrigger
                className={cn(
                  errors.wallet && "border-destructive focus:ring-destructive",
                )}
              >
                <SelectValue placeholder={t("gold.sellWalletPlaceholder")} />
               </SelectTrigger>
              <SelectContent>
                {wallets.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    <span className="flex items-center justify-between w-full gap-3">
                      <span className="flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
                        {w.name}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.wallet && (
              <p className="text-xs text-destructive">{errors.wallet}</p>
            )}
          </div>

          {totalRevenue > 0 && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex justify-between items-center mt-2">
              <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                {t("stocks.totalRevenue")}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {fmtVND(totalRevenue)}
              </span>
            </div>
          )}

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("dialog.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t("dialog.saving") : t("stocks.sellSubmit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
