export type WalletType = "cash" | "bank" | "ewallet" | "credit";

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  type: WalletType;
  icon: string; // lucide icon name
  color: string; // tailwind bg class token
  note?: string;
}

export const WALLET_TYPE_LABELS: Record<
  WalletType,
  { vi: string; en: string }
> = {
  cash: { vi: "Tiền mặt", en: "Cash" },
  bank: { vi: "Ngân hàng", en: "Bank" },
  ewallet: { vi: "Ví điện tử", en: "E-Wallet" },
  credit: { vi: "Thẻ tín dụng", en: "Credit Card" },
};

export const WALLET_ICONS = [
  "Wallet",
  "Landmark",
  "CreditCard",
  "Smartphone",
  "Banknote",
  "PiggyBank",
  "Building2",
  "CircleDollarSign",
] as const;

export const WALLET_COLORS = [
  { name: "primary", class: "bg-primary text-primary-foreground" },
  { name: "blue", class: "bg-blue-500 text-white" },
  { name: "purple", class: "bg-purple-500 text-white" },
  { name: "orange", class: "bg-orange-500 text-white" },
  { name: "rose", class: "bg-rose-500 text-white" },
  { name: "amber", class: "bg-amber-500 text-white" },
  { name: "sky", class: "bg-sky-500 text-white" },
  { name: "emerald", class: "bg-emerald-600 text-white" },
] as const;
