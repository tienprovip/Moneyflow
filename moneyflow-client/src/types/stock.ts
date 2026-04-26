export interface StockBuyLog {
  _id: string;
  quantity: number;
  buyPrice: number;
  purchaseAmount: number;
  avgBuyPriceAfter: number;
  buyDate: string;
  accountId?: string;
  transactionId?: string;
}

export interface StockSellLog {
  _id: string;
  quantity: number;
  sellPrice: number;
  totalSellAmount: number;
  avgCostBasis: number;
  profit: number;
  sellDate: string;
  sellAccountId: string;
  transferTransactionId?: string;
  incomeTransactionId?: string;
}

export interface StockApiResponse {
  _id: string;
  userId: string;
  symbol: string;
  currencyCode: string;
  totalQty: number;
  avgBuyPrice: number;
  totalCostBasis: number;
  primaryAccountId?: { _id: string; name: string; type: string } | null;
  status: "holding" | "sold";
  buyLogs: StockBuyLog[];
  sellLogs: StockSellLog[];
  createdAt: string;
  updatedAt: string;
}

// ─── Frontend types (dùng trong UI) ──────────────────────────────────────────

/** Dữ liệu hiển thị ở bảng chính (Aggregate theo Symbol) */
export interface StockPosition {
  id: string;          // Stock document _id
  symbol: string;
  name: string;        // Tên cty (tạm thời mock hoặc map)
  quantity: number;    // totalQty
  avgPrice: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  pl: number;
  plPct: string;
  firstPurchaseDate: string; 
  status: "holding" | "sold";
}

/** Lịch sử mua */
export interface StockBuyHistory {
  id: string;
  stockId: string;
  symbol: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
}

/** Lịch sử bán */
export interface StockSellHistory {
  id: string;
  stockId: string;
  symbol: string;
  quantity: number;
  sellPrice: number;
  sellDate: string;
  walletId: string;
  profit: number;
}
