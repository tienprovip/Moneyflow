
// ─── Enum khớp với backend ───────────────────────────────────────────────────
export enum GoldType {
  SJC9999 = "SJC9999",       // Vàng miếng SJC
  KGB = "KGB",               // Nhẫn Tròn ép vỉ Kim Gia Bảo 24K (999.9)
  GOLD_9999 = "9999",        // Vàng trang sức 24K (999.9)
  GOLD_999 = "999",          // Vàng trang sức 24K (99.9)
  NL9999 = "NL9999",         // Vàng nguyên liệu 999.9
  NL999 = "NL999",           // Vàng nguyên liệu 99.9
}

export const GOLD_TYPE_LABELS: Record<GoldType, string> = {
  [GoldType.SJC9999]: "SJC",
  [GoldType.KGB]: "Nhẫn Kim Gia Bảo 999.9",
  [GoldType.GOLD_9999]: "Trang sức 999.9",
  [GoldType.GOLD_999]: "Trang sức 99.9",
  [GoldType.NL9999]: "Nguyên liệu 999.9",
  [GoldType.NL999]: "Nguyên liệu 99.9",
};

export const GOLD_TYPE_OPTIONS = Object.values(GoldType).map((v) => ({
  value: v,
  label: GOLD_TYPE_LABELS[v],
}));

// ─── API Response Interfaces (phản ánh backend IGold) ────────────────────────
export interface GoldBuyLog {
  _id: string;
  weight: number;
  buyPrice: number;
  purchaseAmount: number;
  avgBuyPriceAfter: number;
  buyDate: string;
  accountId?: string;
  transactionId?: string;
}

export interface GoldSellLog {
  _id: string;
  weight: number;
  sellPrice: number;
  totalSellAmount: number;
  avgCostBasis: number;
  profit: number;
  sellDate: string;
  sellAccountId: string;
  transferTransactionId?: string;
  incomeTransactionId?: string;
}

export interface GoldApiResponse {
  _id: string;
  userId: string;
  goldType: GoldType;
  currencyCode: string;
  totalWeight: number;
  avgBuyPrice: number;
  totalCostBasis: number;
  primaryAccountId?: { _id: string; name: string; type: string } | null;
  note?: string;
  status: "holding" | "sold";
  buyLogs: GoldBuyLog[];
  sellLogs: GoldSellLog[];
  createdAt: string;
  updatedAt: string;
}

// ─── Frontend types (dùng trong UI) ──────────────────────────────────────────

/** Một lần mua vàng (map từ GoldBuyLog) */
export interface GoldHolding {
  id: string;         // buyLog._id
  goldId: string;     // Gold document _id
  type: GoldType;
  quantity: number;   // weight
  purchaseDate: string;
  purchasePrice: number; // buyPrice
  notes?: string;
}

/** Một lần bán vàng (map từ GoldSellLog) */
export interface GoldSale {
  id: string;            // sellLog._id
  goldId: string;
  type: GoldType;
  quantity: number;      // weight
  sellPrice: number;
  sellDate: string;
  walletId: string;      // sellAccountId
  avgPriceAtSell: number; // avgCostBasis / weight
}

/** Aggregate cho từng loại vàng (tính ở client) */
export interface GoldTypeAggregate {
  goldId: string;
  type: GoldType;
  totalQty: number;
  avgPrice: number;
  totalCost: number;
  currentPrice: number;
  currentValue: number;
  pl: number;
  plPct: number;
  buyCount: number;
  status: "holding" | "sold";
}
