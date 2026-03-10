/**
 * Shared formatting utilities for Vietnamese Dong currency
 */

export const fmtVND = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    v,
  );

export const fmtShort = (v: number) => {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(0)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
  return v.toLocaleString("vi-VN");
};

export const formatVND = (value: number): string =>
  new Intl.NumberFormat("vi-VN").format(Math.round(value));
