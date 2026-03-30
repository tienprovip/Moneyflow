import { useLanguage } from "@/hooks/use-language";
import { formatVND } from "@/lib/format";
import { Wallet, WALLET_COLORS, WalletType } from "@/types/wallet";
import { useCallback, useMemo, useState } from "react";

type WalletFormErrors = Partial<Record<"name" | "balance" | "note", string>>;
type WalletFormTouched = Record<keyof WalletFormErrors, boolean>;

export interface WalletFormValues {
  balance: number;
  color: string;
  icon: string;
  name: string;
  note?: string;
  type: WalletType;
}

export const MAX_WALLET_NOTE_LENGTH = 255;

const parseFormattedBalance = (value: string): number | null => {
  const trimmedValue = value.trim();

  if (!trimmedValue) return null;

  const isNegative = trimmedValue.startsWith("-");
  const digits = trimmedValue.replace(/\D/g, "");

  if (!digits) return null;

  const parsedValue = Number(`${isNegative ? "-" : ""}${digits}`);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const formatBalanceInput = (value: string): string => {
  const trimmedValue = value.trim();

  if (!trimmedValue) return "";

  const isNegative = trimmedValue.startsWith("-");
  const digits = trimmedValue.replace(/\D/g, "");

  if (!digits) {
    return isNegative ? "-" : "";
  }

  return `${isNegative ? "-" : ""}${formatVND(Number(digits))}`;
};

const formatBalanceFromNumber = (value: number): string => {
  const absoluteValue = Math.abs(Math.trunc(value));
  const formattedValue = formatVND(absoluteValue);

  return value < 0 ? `-${formattedValue}` : formattedValue;
};

export const useWalletForm = () => {
  const { t } = useLanguage();

  const [formName, setFormName] = useState("");
  const [formBalance, setFormBalance] = useState("");
  const [formType, setFormType] = useState<WalletType>("cash");
  const [formIcon, setFormIcon] = useState<string>("Wallet");
  const [formColor, setFormColor] = useState<string>(WALLET_COLORS[0].class);
  const [formNote, setFormNote] = useState("");
  const [formTouched, setFormTouched] = useState<WalletFormTouched>({
    name: false,
    balance: false,
    note: false,
  });

  const getWalletFormErrors = useCallback(
    (showAllErrors = false): WalletFormErrors => {
      const errors: WalletFormErrors = {};
      const shouldValidateName = showAllErrors || formTouched.name;
      const shouldValidateBalance = showAllErrors || formTouched.balance;
      const shouldValidateNote = showAllErrors || formTouched.note;

      if (shouldValidateName && !formName.trim()) {
        errors.name = t("validation.nameRequired");
      }

      if (shouldValidateBalance && !formBalance.trim()) {
        errors.balance = t("validation.balanceRequired");
      } else if (
        shouldValidateBalance &&
        parseFormattedBalance(formBalance) === null
      ) {
        errors.balance = t("validation.balanceInvalid");
      }

      if (
        shouldValidateNote &&
        formNote.trim().length > MAX_WALLET_NOTE_LENGTH
      ) {
        errors.note = t("validation.noteTooLong");
      }

      return errors;
    },
    [formBalance, formName, formNote, formTouched, t],
  );

  const formErrors = useMemo(
    () => getWalletFormErrors(false),
    [getWalletFormErrors],
  );

  const handleBalanceChange = useCallback((value: string) => {
    setFormBalance(formatBalanceInput(value));
  }, []);

  const touchFormField = useCallback((field: keyof WalletFormTouched) => {
    setFormTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const resetFormValidation = useCallback(() => {
    setFormTouched({
      name: false,
      balance: false,
      note: false,
    });
  }, []);

  const resetForm = useCallback(() => {
    setFormName("");
    setFormBalance("");
    setFormType("cash");
    setFormIcon("Wallet");
    setFormColor(WALLET_COLORS[0].class);
    setFormNote("");
    resetFormValidation();
  }, [resetFormValidation]);

  const populateForm = useCallback(
    (wallet: Wallet) => {
      setFormName(wallet.name);
      setFormBalance(formatBalanceFromNumber(wallet.balance));
      setFormType(wallet.type);
      setFormIcon(wallet.icon);
      setFormColor(wallet.color);
      setFormNote(wallet.note || "");
      resetFormValidation();
    },
    [resetFormValidation],
  );

  const validateForm = useCallback((): WalletFormValues | null => {
    setFormTouched({
      name: true,
      balance: true,
      note: true,
    });

    const nextErrors = getWalletFormErrors(true);
    if (Object.keys(nextErrors).length > 0) return null;

    const balance = parseFormattedBalance(formBalance);
    if (balance === null) return null;

    return {
      balance,
      color: formColor,
      icon: formIcon,
      name: formName.trim(),
      note: formNote || undefined,
      type: formType,
    };
  }, [
    formBalance,
    formColor,
    formIcon,
    formName,
    formNote,
    formType,
    getWalletFormErrors,
  ]);

  return {
    formBalance,
    formColor,
    formErrors,
    formIcon,
    formName,
    formNote,
    formType,
    handleBalanceChange,
    maxNoteLength: MAX_WALLET_NOTE_LENGTH,
    populateForm,
    resetForm,
    setFormColor,
    setFormIcon,
    setFormName,
    setFormNote,
    setFormType,
    touchFormField,
    validateForm,
  };
};
