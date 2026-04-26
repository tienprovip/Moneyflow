import axiosInstance from "@/api/axios";
import type { GoldApiResponse } from "@/types/gold";

// ─── GET LIST ────────────────────────────────────────────────────────────────
export const fetchGolds = async (params?: {
  status?: "holding" | "sold";
  goldType?: string;
}): Promise<GoldApiResponse[]> => {
  const res = await axiosInstance.get<GoldApiResponse[]>("/gold", { params });
  return Array.isArray(res.data) ? res.data : [];
};

// ─── GET MARKET PRICES ───────────────────────────────────────────────────────
export const fetchMarketPrices = async (): Promise<Record<string, { buy: number; sell: number }>> => {
  const res = await axiosInstance.get("/gold/market-prices");
  return res.data;
};

// ─── GET MARKET HISTORY ──────────────────────────────────────────────────────
export interface HistoricalPrice {
  date: string;
  buy: number;
  sell: number;
}

export const fetchHistoricalPrices = async (): Promise<Record<string, HistoricalPrice[]>> => {
  const res = await axiosInstance.get("/gold/market-prices/history");
  return res.data;
};

// ─── CREATE (vị thế mới — lần mua đầu tiên của 1 loại vàng) ──────────────────
export interface CreateGoldPayload {
  goldType: string;
  weight: number;
  buyPrice: number;
  buyDate?: string;
  sourceAccountId?: string;
  note?: string;
  currencyCode?: string;
}

export const createGold = async (
  payload: CreateGoldPayload,
): Promise<GoldApiResponse> => {
  const res = await axiosInstance.post<GoldApiResponse>("/gold", payload);
  return res.data;
};

// ─── BUY MORE (mua thêm vào vị thế đã có) ────────────────────────────────────
export interface BuyMoreGoldPayload {
  weight: number;
  buyPrice: number;
  buyDate?: string;
  accountId?: string;
}

export const buyMoreGold = async (
  goldId: string,
  payload: BuyMoreGoldPayload,
): Promise<GoldApiResponse> => {
  const res = await axiosInstance.post<GoldApiResponse>(
    `/gold/buy/${goldId}`,
    payload,
  );
  return res.data;
};

// ─── SELL ────────────────────────────────────────────────────────────────────
export interface SellGoldPayload {
  weight: number;
  sellPrice: number;
  sellAccountId: string;
  sellDate?: string;
}

export const sellGold = async (
  goldId: string,
  payload: SellGoldPayload,
): Promise<GoldApiResponse> => {
  const res = await axiosInstance.post<GoldApiResponse>(
    `/gold/sell/${goldId}`,
    payload,
  );
  return res.data;
};

// ─── DELETE ──────────────────────────────────────────────────────────────────
export const deleteGold = async (goldId: string): Promise<void> => {
  await axiosInstance.delete(`/gold/${goldId}`);
};
