import type { GoldHolding } from "@/components/gold/GoldDialog";

export type GoldType = GoldHolding["type"];

export interface GoldSale {
  id: string;
  type: GoldType;
  quantity: number;
  sellPrice: number;
  sellDate: string; // yyyy-MM-dd
  walletId: string;
  /** Avg cost basis at the time of sale (per unit). Used to compute realized P/L. */
  avgPriceAtSell: number;
}

export interface GoldTypeAggregate {
  type: GoldType;
  totalQty: number;
  avgPrice: number;
  totalCost: number;
  currentPrice: number;
  currentValue: number;
  pl: number;
  plPct: number;
  buyCount: number;
}
