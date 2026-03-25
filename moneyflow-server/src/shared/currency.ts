import { LocalizedText } from "./localized";

export enum CurrencyCode {
  VND = "VND",
  USD = "USD",
  EUR = "EUR",
}

export const currencyLabels: Record<CurrencyCode, LocalizedText> = {
  [CurrencyCode.VND]: {
    en: "Vietnamese Dong",
    vi: "Việt Nam Đồng",
  },
  [CurrencyCode.USD]: {
    en: "US Dollar",
    vi: "Đô La Mỹ",
  },
  [CurrencyCode.EUR]: {
    en: "Euro",
    vi: "Euro",
  },
};
