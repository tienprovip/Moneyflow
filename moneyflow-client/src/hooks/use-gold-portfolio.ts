import { useMemo, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/getErrorMessage";
import {
  fetchGolds,
  createGold,
  buyMoreGold,
  sellGold,
  deleteGold,
  fetchMarketPrices,
  type CreateGoldPayload,
  type BuyMoreGoldPayload,
  type SellGoldPayload,
} from "@/api/gold";
import {
  GoldApiResponse,
  GoldHolding,
  GoldSale,
  GoldType,
  GoldTypeAggregate,
} from "@/types/gold";

// ─── Helpers: map API response → frontend types ───────────────────────────────

// Map old enum to new enum for backward compatibility
const mapLegacyType = (type: string): GoldType => {
  const legacyMap: Record<string, GoldType> = {
    "gold_sjc": GoldType.SJC9999,
    "gold_999_9": GoldType.GOLD_9999,
    "gold_99_9": GoldType.GOLD_999,
    "raw_gold_999_9": GoldType.NL9999,
    "raw_gold_99_9": GoldType.NL999,
  };
  return legacyMap[type] || (type as GoldType);
};

const mapBuyLogsToHoldings = (gold: GoldApiResponse): GoldHolding[] =>
  gold.buyLogs.map((log) => ({
    id: log._id,
    goldId: gold._id,
    type: mapLegacyType(gold.goldType),
    quantity: log.weight,
    purchaseDate: log.buyDate.slice(0, 10),
    purchasePrice: log.buyPrice,
    notes: gold.note,
  }));

const mapSellLogsToSales = (gold: GoldApiResponse): GoldSale[] =>
  gold.sellLogs.map((log) => ({
    id: log._id,
    goldId: gold._id,
    type: mapLegacyType(gold.goldType),
    quantity: log.weight,
    sellPrice: log.sellPrice,
    sellDate: log.sellDate.slice(0, 10),
    walletId: log.sellAccountId,
    avgPriceAtSell: log.weight > 0 ? log.avgCostBasis / log.weight : 0,
  }));

const buildAggregate = (
  gold: GoldApiResponse,
  prices: Record<string, { buy: number; sell: number }>,
): GoldTypeAggregate => {
  const mappedType = mapLegacyType(gold.goldType);
  const currentPrice = prices[mappedType]?.sell ?? 0;
  const currentValue = gold.totalWeight * currentPrice;
  const pl = currentValue - gold.totalCostBasis;
  const plPct =
    gold.totalCostBasis > 0 ? (pl / gold.totalCostBasis) * 100 : 0;
  return {
    goldId: gold._id,
    type: mappedType,
    totalQty: gold.totalWeight,
    avgPrice: gold.avgBuyPrice,
    totalCost: gold.totalCostBasis,
    currentPrice,
    currentValue,
    pl,
    plPct,
    buyCount: gold.buyLogs.length,
    status: gold.status,
  };
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useGoldMarketPrices = () => {
  return useQuery({
    queryKey: [...queryKeys.gold, "marketPrices"],
    queryFn: fetchMarketPrices,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 mins
    staleTime: 4 * 60 * 1000,
  });
};

interface UseGoldPortfolioOptions {
  /** Giá thị trường hiện tại — vẫn dùng mock cho đến khi có API giá */
  prices: Record<string, { buy: number; sell: number }>;
}

export const useGoldPortfolio = ({ prices }: UseGoldPortfolioOptions) => {
  const queryClient = useQueryClient();

  // ─── Query ────────────────────────────────────────────────────────────────
  const goldsQuery = useQuery({
    queryKey: queryKeys.gold,
    queryFn: () => fetchGolds({ status: "holding" }),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Fetch tất cả (kể cả đã bán hết) để hiển thị sell history
  const allGoldsQuery = useQuery({
    queryKey: [...queryKeys.gold, "all"],
    queryFn: () => fetchGolds(),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // ─── Derived state ────────────────────────────────────────────────────────
  const goldPositions = goldsQuery.data ?? [];
  const allPositions = allGoldsQuery.data ?? [];

  const holdings = useMemo<GoldHolding[]>(
    () => goldPositions.flatMap(mapBuyLogsToHoldings),
    [goldPositions],
  );

  const sales = useMemo<GoldSale[]>(
    () => allPositions.flatMap(mapSellLogsToSales),
    [allPositions],
  );

  const aggregates = useMemo<GoldTypeAggregate[]>(
    () =>
      goldPositions
        .filter((g) => g.status === "holding" && g.totalWeight > 1e-9)
        .map((g) => buildAggregate(g, prices)),
    [goldPositions, prices],
  );

  const totals = useMemo(() => {
    const spent = aggregates.reduce((s, a) => s + a.totalCost, 0);
    const current = aggregates.reduce((s, a) => s + a.currentValue, 0);
    const qty = aggregates.reduce((s, a) => s + a.totalQty, 0);
    const pl = current - spent;
    return {
      totalSpent: spent,
      currentValue: current,
      totalQuantity: qty,
      profitLoss: pl,
      profitPct: spent > 0 ? ((pl / spent) * 100).toFixed(2) : "0",
    };
  }, [aggregates]);

  // ─── Mutations ────────────────────────────────────────────────────────────

  const invalidateGold = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.gold });
    void queryClient.invalidateQueries({ queryKey: queryKeys.wallets });
    void queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
  }, [queryClient]);

  /** Thêm holding: tạo vị thế mới nếu chưa có, hoặc buyMore nếu đã có */
  const addHoldingMutation = useMutation({
    mutationFn: async (data: {
      type: GoldType;
      quantity: number;
      purchasePrice: number;
      purchaseDate: string;
      notes?: string;
      sourceAccountId?: string;
    }) => {
      // Tìm vị thế đang hold của goldType này
      const existing = goldPositions.find(
        (g) => g.goldType === data.type && g.status === "holding",
      );

      if (existing) {
        // Mua thêm vào vị thế đã có
        const payload: BuyMoreGoldPayload = {
          weight: data.quantity,
          buyPrice: data.purchasePrice,
          buyDate: data.purchaseDate,
          accountId: data.sourceAccountId,
        };
        return buyMoreGold(existing._id, payload);
      } else {
        // Tạo vị thế mới
        const payload: CreateGoldPayload = {
          goldType: data.type,
          weight: data.quantity,
          buyPrice: data.purchasePrice,
          buyDate: data.purchaseDate,
          sourceAccountId: data.sourceAccountId,
          note: data.notes,
        };
        return createGold(payload);
      }
    },
    onSuccess: () => invalidateGold(),
    onError: (err) => {
      toast({
        title: "Lỗi",
        description: getErrorMessage(err, "Không thể thêm vàng."),
        variant: "destructive",
      });
    },
  });

  /** Xóa vị thế vàng (chỉ xóa được khi chưa bán) */
  const deleteHoldingMutation = useMutation({
    mutationFn: (goldId: string) => deleteGold(goldId),
    onSuccess: () => invalidateGold(),
    onError: (err) => {
      toast({
        title: "Lỗi",
        description: getErrorMessage(err, "Không thể xóa vàng."),
        variant: "destructive",
      });
    },
  });

  /** Bán vàng */
  const sellGoldMutation = useMutation({
    mutationFn: async (data: {
      goldId: string;
      weight: number;
      sellPrice: number;
      sellDate: string;
      sellAccountId: string;
    }) => {
      const payload: SellGoldPayload = {
        weight: data.weight,
        sellPrice: data.sellPrice,
        sellAccountId: data.sellAccountId,
        sellDate: data.sellDate,
      };
      return sellGold(data.goldId, payload);
    },
    onSuccess: () => invalidateGold(),
    onError: (err) => {
      toast({
        title: "Lỗi",
        description: getErrorMessage(err, "Không thể bán vàng."),
        variant: "destructive",
      });
    },
  });

  // ─── Public API ───────────────────────────────────────────────────────────

  /** Thêm/mua thêm vàng */
  const addHolding = useCallback(
    async (data: {
      type: GoldType;
      quantity: number;
      purchasePrice: number;
      purchaseDate: string;
      notes?: string;
      sourceAccountId?: string;
    }) => {
      await addHoldingMutation.mutateAsync(data);
    },
    [addHoldingMutation],
  );

  /**
   * updateHolding — backend không hỗ trợ update buyLog trực tiếp.
   * Tính năng này tạm thời không có hiệu lực.
   */
  const updateHolding = useCallback(
    async (_id: string, _data: Partial<GoldHolding>) => {
      toast({
        title: "Chưa hỗ trợ",
        description: "Chỉnh sửa lần mua chưa được hỗ trợ.",
        variant: "destructive",
      });
    },
    [],
  );

  /** Xóa vị thế vàng theo goldId */
  const deleteHolding = useCallback(
    async (goldId: string) => {
      await deleteHoldingMutation.mutateAsync(goldId);
    },
    [deleteHoldingMutation],
  );

  /** Bán vàng theo loại */
  const sellGoldByType = useCallback(
    async (
      goldType: GoldType,
      weight: number,
      sellPrice: number,
      sellDate: string,
      sellAccountId: string,
    ) => {
      const position = goldPositions.find(
        (g) => g.goldType === goldType && g.status === "holding",
      );
      if (!position) return;
      await sellGoldMutation.mutateAsync({
        goldId: position._id,
        weight,
        sellPrice,
        sellDate,
        sellAccountId,
      });
    },
    [goldPositions, sellGoldMutation],
  );

  return {
    holdings,
    sales,
    aggregates,
    totals,
    addHolding,
    updateHolding,
    deleteHolding,
    sellGold: sellGoldByType,
    isLoading: goldsQuery.isLoading,
    isError: goldsQuery.isError,
    error: goldsQuery.error,
  };
};
