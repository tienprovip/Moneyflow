import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import WalletIcon from "@/components/wallets/WalletIcon";
import { useLanguage } from "@/hooks/use-language";
import {
  WALLET_COLORS,
  WALLET_ICONS,
  WALLET_TYPE_LABELS,
  WalletType,
} from "@/types/wallet";
import { Loader2 } from "lucide-react";

type WalletFormErrors = Partial<Record<"name" | "balance" | "note", string>>;
type WalletFormField = "name" | "balance" | "note";

interface WalletFormDialogProps {
  formBalance: string;
  formColor: string;
  formErrors: WalletFormErrors;
  formIcon: string;
  formName: string;
  formNote: string;
  formType: WalletType;
  isEditing: boolean;
  isSaving: boolean;
  maxNoteLength: number;
  onBalanceChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  open: boolean;
  setFormColor: (value: string) => void;
  setFormIcon: (value: string) => void;
  setFormName: (value: string) => void;
  setFormNote: (value: string) => void;
  setFormType: (value: WalletType) => void;
  touchFormField: (field: WalletFormField) => void;
}

const WalletFormDialog = ({
  formBalance,
  formColor,
  formErrors,
  formIcon,
  formName,
  formNote,
  formType,
  isEditing,
  isSaving,
  maxNoteLength,
  onBalanceChange,
  onOpenChange,
  onSave,
  open,
  setFormColor,
  setFormIcon,
  setFormName,
  setFormNote,
  setFormType,
  touchFormField,
}: WalletFormDialogProps) => {
  const { t, locale } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto hide-scrollbar">
        <DialogTitle>
          {isEditing ? t("wallets.editTitle") : t("wallets.addTitle")}
        </DialogTitle>
        <DialogDescription>
          {isEditing ? t("wallets.editDesc") : t("wallets.addDesc")}
        </DialogDescription>
        <form
          className="space-y-4 pt-2"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          <div>
            <Label>{t("wallets.nameLabel")}</Label>
            <Input
              value={formName}
              aria-invalid={!!formErrors.name}
              onBlur={() => touchFormField("name")}
              onChange={(e) => setFormName(e.target.value)}
              placeholder={t("wallets.namePlaceholder")}
            />
            {formErrors.name && (
              <p className="mt-1 text-xs text-destructive">{formErrors.name}</p>
            )}
          </div>
          <div>
            <Label>{t("wallets.balanceLabel")}</Label>
            <Input
              aria-invalid={!!formErrors.balance}
              inputMode="numeric"
              type="text"
              value={formBalance}
              onBlur={() => touchFormField("balance")}
              onChange={(e) => onBalanceChange(e.target.value)}
            />
            {formErrors.balance && (
              <p className="mt-1 text-xs text-destructive">
                {formErrors.balance}
              </p>
            )}
          </div>
          <div>
            <Label>{t("wallets.typeLabel")}</Label>
            <Select value={formType} onValueChange={(value) => setFormType(value as WalletType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(WALLET_TYPE_LABELS) as WalletType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {WALLET_TYPE_LABELS[type][locale]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("wallets.iconLabel")}</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {WALLET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormIcon(icon)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${formIcon === icon ? "border-primary bg-primary/10" : "border-border hover:bg-secondary"}`}
                >
                  <WalletIcon name={icon} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>{t("wallets.colorLabel")}</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {WALLET_COLORS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setFormColor(color.class)}
                  className={`w-8 h-8 rounded-full ${color.class} ${formColor === color.class ? "ring-2 ring-offset-2 ring-primary" : ""} transition-all`}
                />
              ))}
            </div>
          </div>
          <div>
            <Label>{t("wallets.noteLabel")}</Label>
            <Textarea
              aria-invalid={!!formErrors.note}
              value={formNote}
              onBlur={() => touchFormField("note")}
              onChange={(e) => setFormNote(e.target.value)}
              placeholder={t("wallets.notePlaceholder")}
              rows={2}
            />
            <div className="mt-1 flex items-center justify-between gap-3">
              <div>
                {formErrors.note && (
                  <p className="text-xs text-destructive">{formErrors.note}</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formNote.length}/{maxNoteLength}
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              {t("dialog.cancel")}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("dialog.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WalletFormDialog;
