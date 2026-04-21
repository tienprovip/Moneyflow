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
import { PopoverTrigger } from "@radix-ui/react-popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

export interface GoldHolding {
  id: string;
  type: "SJC" | "PNJ" | "DOJI" | "9999";
  quantity: number;
  purchaseDate: string;
  purchasePrice: number;
  notes?: string;
}

const GOLD_TYPES = ["SJC", "PNJ", "DOJI", "9999"] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: GoldHolding | null;
  onSave: (data: GoldHolding) => void;
}

export const GoldDialog = ({ open, onOpenChange, editing, onSave }: Props) => {
  const { t } = useLanguage();
  const [formType, setFormType] = useState("SJC");
  const [formQty, setFormQty] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDate, setFormDate] = useState<Date | undefined>(new Date());
  const [formNotes, setFormNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const resetToEditing = (h: GoldHolding | null) => {
    if (h) {
      setFormType(h.type);
      setFormQty(h.quantity.toString());
      setFormPrice(h.purchasePrice.toString());
      setFormDate(new Date(h.purchaseDate));
      setFormNotes(h.notes || "");
    } else {
      setFormType("SJC");
      setFormQty("");
      setFormPrice("");
      setFormDate(new Date());
      setFormNotes("");
    }
    setErrors({});
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) resetToEditing(editing);
    onOpenChange(isOpen);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    const qty = Number(formQty);
    if (!formQty || Number.isNaN(qty) || qty <= 0) e.qty = t("gold.qtyError");
    const price = Number(formPrice);
    if (!formPrice || Number.isNaN(price) || price <= 0)
      e.price = t("gold.priceError");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    onSave({
      id: editing?.id || crypto.randomUUID(),
      type: formType as GoldHolding["type"],
      quantity: Number(formQty),
      purchasePrice: Number(formPrice),
      purchaseDate: formDate
        ? format(formDate, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      notes: formNotes.trim() || undefined,
    });

    setSaving(false);
    onOpenChange(false);
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
            <div className="space-y-1.5">
              <Label>{t("gold.typeCol")}</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOLD_TYPES.map((gt) => (
                    <SelectItem key={gt} value={gt}>
                      {gt}
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
                type="number"
                placeholder="0"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                min={0}
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
          <Button onClick={handleSave} disabled={saving}>
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
