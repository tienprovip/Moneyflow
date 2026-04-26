import { useMemo, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/getErrorMessage";
import {
  fetchStocks,
  createStock,
  buyMoreStock,
  sellStock,
  deleteStock,
  type CreateStockPayload,
  type BuyMoreStockPayload,
  type SellStockPayload,
} from "@/api/stock";
import { StockApiResponse, StockPosition } from "@/types/stock";

const MOCK_MARKET_PRICES: Record<string, number> = {
  VNM: 85000,
  FPT: 128000,
  VCB: 92500,
  HPG: 31200,
  MWG: 48500,
  VHM: 45800,
  TCB: 37200,
};

const getMarketPrice = (symbol: string, avgPrice: number) => {
  return MOCK_MARKET_PRICES[symbol.toUpperCase()] || avgPrice * 1.02; // Default 2% profit
};

const buildStockPosition = (stock: StockApiResponse): StockPosition => {
  const currentPrice = getMarketPrice(stock.symbol, stock.avgBuyPrice);
  const currentValue = stock.totalQty * currentPrice;
  const pl = currentValue - stock.totalCostBasis;
  const plPct = stock.totalCostBasis > 0 ? ((pl / stock.totalCostBasis) * 100).toFixed(2) : "0";
  
  // Lấy ngày mua đầu tiên từ buyLogs
  const firstPurchaseDate = stock.buyLogs.length > 0 
    ? new Date(Math.min(...stock.buyLogs.map(l => new Date(l.buyDate).getTime()))).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  return {
    id: stock._id,
    symbol: stock.symbol,
    name: stock.symbol, // We don't have company names in backend, using symbol
    quantity: stock.totalQty,
    avgPrice: stock.avgBuyPrice,
    currentPrice,
    totalCost: stock.totalCostBasis,
    currentValue,
    pl,
    plPct,
    firstPurchaseDate,
    status: stock.status,
  };
};

export const useStocks = () => {
  const queryClient = useQueryClient();

  // ─── Query ────────────────────────────────────────────────────────────────
  const stocksQuery = useQuery({
    queryKey: queryKeys.stock,
    queryFn: () => fetchStocks({ status: "holding" }),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const stockPositions = stocksQuery.data ?? [];

  const holdings = useMemo<StockPosition[]>(
    () => stockPositions
      .filter((s) => s.status === "holding" && s.totalQty > 0)
      .map(buildStockPosition),
    [stockPositions],
  );

  const totals = useMemo(() => {
    const spent = holdings.reduce((s, a) => s + a.totalCost, 0);
    const current = holdings.reduce((s, a) => s + a.currentValue, 0);
    const pl = current - spent;
    return {
      totalInvested: spent,
      totalCurrentValue: current,
      totalPL: pl,
      totalPLPct: spent > 0 ? ((pl / spent) * 100).toFixed(2) : "0",
      totalStocks: holdings.length,
    };
  }, [holdings]);

  // ─── Mutations ────────────────────────────────────────────────────────────

  const invalidateStocks = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.stock });
    void queryClient.invalidateQueries({ queryKey: queryKeys.wallets });
    void queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
  }, [queryClient]);

  const addStockMutation = useMutation({
    mutationFn: async (data: {
      symbol: string;
      quantity: number;
      buyPrice: number;
      buyDate: string;
      sourceAccountId?: string;
    }) => {
      const existing = stockPositions.find(
        (s) => s.symbol.toUpperCase() === data.symbol.toUpperCase() && s.status === "holding",
      );

      if (existing) {
        const payload: BuyMoreStockPayload = {
          quantity: data.quantity,
          buyPrice: data.buyPrice,
          buyDate: data.buyDate,
          accountId: data.sourceAccountId,
        };
        return buyMoreStock(existing._id, payload);
      } else {
        const payload: CreateStockPayload = {
          symbol: data.symbol,
          quantity: data.quantity,
          buyPrice: data.buyPrice,
          buyDate: data.buyDate,
          sourceAccountId: data.sourceAccountId,
        };
        return createStock(payload);
      }
    },
    onSuccess: () => invalidateStocks(),
    onError: (err) => {
      toast({
        title: "Lỗi",
        description: getErrorMessage(err, "Không thể thêm cổ phiếu."),
        variant: "destructive",
      });
    },
  });

  const sellStockMutation = useMutation({
    mutationFn: async (data: {
      stockId: string;
      quantity: number;
      sellPrice: number;
      sellDate: string;
      sellAccountId: string;
    }) => {
      const payload: SellStockPayload = {
        quantity: data.quantity,
        sellPrice: data.sellPrice,
        sellDate: data.sellDate,
        sellAccountId: data.sellAccountId,
      };
      return sellStock(data.stockId, payload);
    },
    onSuccess: () => invalidateStocks(),
    onError: (err) => {
      toast({
        title: "Lỗi",
        description: getErrorMessage(err, "Không thể bán cổ phiếu."),
        variant: "destructive",
      });
    },
  });

  const deleteStockMutation = useMutation({
    mutationFn: (stockId: string) => deleteStock(stockId),
    onSuccess: () => invalidateStocks(),
    onError: (err) => {
      toast({
        title: "Lỗi",
        description: getErrorMessage(err, "Không thể xóa cổ phiếu."),
        variant: "destructive",
      });
    },
  });

  // ─── Public API ───────────────────────────────────────────────────────────

  const addStock = useCallback(
    async (data: {
      symbol: string;
      quantity: number;
      buyPrice: number;
      buyDate: string;
      sourceAccountId?: string;
    }) => {
      await addStockMutation.mutateAsync(data);
    },
    [addStockMutation],
  );

  const sellStockAction = useCallback(
    async (data: {
      stockId: string;
      quantity: number;
      sellPrice: number;
      sellDate: string;
      sellAccountId: string;
    }) => {
      await sellStockMutation.mutateAsync(data);
    },
    [sellStockMutation],
  );

  const deleteStockAction = useCallback(
    async (stockId: string) => {
      await deleteStockMutation.mutateAsync(stockId);
    },
    [deleteStockMutation],
  );

  return {
    holdings,
    totals,
    addStock,
    sellStock: sellStockAction,
    deleteStock: deleteStockAction,
    isLoading: stocksQuery.isLoading,
    isError: stocksQuery.isError,
    error: stocksQuery.error,
  };
};
