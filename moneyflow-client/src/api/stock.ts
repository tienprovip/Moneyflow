import axios from "./axios";
import { StockApiResponse } from "@/types/stock";

export interface CreateStockPayload {
  symbol: string;
  quantity: number;
  buyPrice: number;
  buyDate?: string;
  currencyCode?: string;
  sourceAccountId?: string;
}

export interface BuyMoreStockPayload {
  quantity: number;
  buyPrice: number;
  buyDate?: string;
  accountId?: string;
}

export interface SellStockPayload {
  quantity: number;
  sellPrice: number;
  sellAccountId: string;
  sellDate?: string;
}

export const fetchStocks = async (params?: {
  status?: "holding" | "sold";
}): Promise<StockApiResponse[]> => {
  const { data } = await axios.get("/stock", { params });
  return data;
};

export const fetchStockById = async (id: string): Promise<StockApiResponse> => {
  const { data } = await axios.get(`/stock/${id}`);
  return data;
};

export const createStock = async (
  payload: CreateStockPayload,
): Promise<StockApiResponse> => {
  const { data } = await axios.post("/stock", payload);
  return data;
};

export const buyMoreStock = async (
  id: string,
  payload: BuyMoreStockPayload,
): Promise<StockApiResponse> => {
  const { data } = await axios.post(`/stock/buy/${id}`, payload);
  return data;
};

export const sellStock = async (
  id: string,
  payload: SellStockPayload,
): Promise<StockApiResponse> => {
  const { data } = await axios.post(`/stock/sell/${id}`, payload);
  return data;
};

export const deleteStock = async (
  id: string,
): Promise<{ message: string }> => {
  const { data } = await axios.delete(`/stock/${id}`);
  return data;
};
