import { formatVND } from "@/lib/format";

export const parseFormattedNumber = (value: string): number | null => {
  const trimmedValue = value.trim();

  if (!trimmedValue) return null;

  const isNegative = trimmedValue.startsWith("-");
  const digits = trimmedValue.replace(/\D/g, "");

  if (!digits) return null;

  const parsedValue = Number(`${isNegative ? "-" : ""}${digits}`);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

export const formatFormattedNumberInput = (value: string): string => {
  const trimmedValue = value.trim();

  if (!trimmedValue) return "";

  const isNegative = trimmedValue.startsWith("-");
  const digits = trimmedValue.replace(/\D/g, "");

  if (!digits) {
    return isNegative ? "-" : "";
  }

  return `${isNegative ? "-" : ""}${formatVND(Number(digits))}`;
};

export const formatFormattedNumberValue = (value: number): string => {
  const absoluteValue = Math.abs(Math.trunc(value));
  const formattedValue = formatVND(absoluteValue);

  return value < 0 ? `-${formattedValue}` : formattedValue;
};
