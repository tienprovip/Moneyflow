import { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useLanguage } from "@/hooks/use-language";
import { Badge } from "@/components/ui/badge";
import { fmtVND } from "@/lib/format";
import type { GoldHolding } from "@/types/gold";
import { GOLD_TYPE_LABELS } from "@/types/gold";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holding: GoldHolding | null;
  currentSellPrice: number;
  wallets: { id: string; name: string }[];
  onSell: (
    holdingId: string,
    quantity: number,
    sellPrice: number,
    sellDate: string,
    walletId: string,
  ) => void;
}

export function SellGoldDialog({
  open,
  onOpenChange,
  holding,
  currentSellPrice,
  wallets,
  onSell,
}: Props) {
  const { t } = useLanguage();
  const [sellQty, setSellQty] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [sellDate, setSellDate] = useState<Date | undefined>(new Date());
  const [walletId, setWalletId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && holding) {
      setSellQty(String(holding.quantity));
      setSellPrice(String(currentSellPrice));
      setSellDate(new Date());
      setWalletId("");
      setErrors({});
    }
  }, [open, holding, currentSellPrice]);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    const qty = Number(sellQty);
    if (!sellQty || Number.isNaN(qty) || qty <= 0) e.qty = t("gold.qtyError");
    if (holding && qty > holding.quantity) e.qty = t("gold.sellQtyExceed");
    const price = Number(sellPrice);
    if (!sellPrice || Number.isNaN(price) || price <= 0)
      e.price = t("gold.priceError");
    if (!walletId) e.wallet = t("gold.sellWalletRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSell = async () => {
    if (!validate() || !holding) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    onSell(
      holding.id,
      Number(sellQty),
      Number(sellPrice),
      sellDate
        ? format(sellDate, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      walletId,
    );
    setSaving(false);
    onOpenChange(false);
  };

  if (!holding) return null;

  const totalSellValue = Number(sellQty || 0) * Number(sellPrice || 0);
  const totalCost = Number(sellQty || 0) * holding.purchasePrice;
  const estimatedPL = totalSellValue - totalCost;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-110">
        <DialogHeader>
          <DialogTitle>{t("gold.sellTitle")}</DialogTitle>
          <DialogDescription>{t("gold.sellDesc")}</DialogDescription>
        </DialogHeader>

        {/* Holding info */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
          <Badge
            variant="secondary"
            className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0"
          >
            {GOLD_TYPE_LABELS[holding.type] ?? holding.type}
          </Badge>
          <div className="flex-1 text-sm">
            <span className="font-medium text-foreground">
              {holding.quantity} {t("gold.unit")}
            </span>
            <span className="text-muted-foreground ml-2">
              • {t("gold.purchasePrice")}: {fmtVND(holding.purchasePrice)}
            </span>
          </div>
        </div>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>
                {t("gold.sellQty")} ({t("gold.unit")})
              </Label>
              <Input
                className={cn(errors.qty && "border-destructive focus-visible:ring-destructive")}
                type="number"
                placeholder="0"
                value={sellQty}
                onChange={(e) => setSellQty(e.target.value)}
                min={0}
                max={holding.quantity}
                step={0.1}
              />
              {errors.qty && (
                <p className="text-xs text-destructive">{errors.qty}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>{t("gold.sellPrice")} (VND)</Label>
              <Input
                className={cn(errors.price && "border-destructive focus-visible:ring-destructive")}
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={sellPrice ? Number(sellPrice).toLocaleString("vi-VN") : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setSellPrice(raw);
                }}
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("gold.sellDate")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !sellDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 w-4 h-4" />
                    {sellDate
                      ? format(sellDate, "dd/MM/yyyy")
                      : t("dialog.datePlaceholder")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={sellDate}
                    onSelect={setSellDate}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label>{t("gold.sellWallet")}</Label>
              <Select value={walletId} onValueChange={setWalletId}>
                <SelectTrigger
                  className={cn(errors.wallet && "border-destructive focus:ring-destructive")}
                >
                  <SelectValue placeholder={t("gold.sellWalletPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.wallet && (
                <p className="text-xs text-destructive">{errors.wallet}</p>
              )}
            </div>
          </div>

          {/* P/L Preview */}
          <div className="p-3 rounded-lg bg-secondary/30 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("gold.sellTotal")}
              </span>
              <span className="font-medium text-foreground">
                {fmtVND(totalSellValue)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("gold.sellCost")}
              </span>
              <span className="font-medium text-foreground">
                {fmtVND(totalCost)}
              </span>
            </div>
            <div className="border-t border-border pt-1.5 flex justify-between text-sm">
              <span className="font-medium text-foreground">
                {t("gold.sellPL")}
              </span>
              <span
                className={`font-bold ${estimatedPL >= 0 ? "text-positive" : "text-negative"}`}
              >
                {estimatedPL >= 0 ? "+" : ""}
                {fmtVND(estimatedPL)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            {t("dialog.cancel")}
          </Button>
          <Button onClick={handleSell} disabled={saving} variant="destructive">
            {saving ? t("dialog.saving") : t("gold.sellConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
