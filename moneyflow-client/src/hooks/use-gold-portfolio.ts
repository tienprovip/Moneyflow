import { useState, useMemo, useCallback } from "react";
import type { GoldHolding } from "@/components/gold/GoldDialog";
import type { GoldSale, GoldType } from "@/types/gold";
import { computeAggregates, reduceHoldingsFIFO } from "@/lib/gold-utils";

interface Args {
  initialHoldings: GoldHolding[];
  initialSales: GoldSale[];
  prices: Record<string, { buy: number; sell: number }>;
}

export const useGoldPortfolio = ({
  initialHoldings,
  initialSales,
  prices,
}: Args) => {
  const [holdings, setHoldings] = useState<GoldHolding[]>(initialHoldings);
  const [sales, setSales] = useState<GoldSale[]>(initialSales);

  const aggregates = useMemo(
    () => computeAggregates(holdings, prices),
    [holdings, prices],
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

  const addHolding = useCallback((data: GoldHolding) => {
    setHoldings((prev) => [data, ...prev]);
  }, []);

  const updateHolding = useCallback((id: string, data: GoldHolding) => {
    setHoldings((prev) => prev.map((h) => (h.id === id ? data : h)));
  }, []);

  const deleteHolding = useCallback((id: string) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const sellGold = useCallback(
    (
      type: GoldType,
      quantity: number,
      sellPrice: number,
      sellDate: string,
      walletId: string,
    ) => {
      const agg = computeAggregates(holdings, prices).find(
        (a) => a.type === type,
      );
      if (!agg) return;
      setHoldings((prev) => reduceHoldingsFIFO(prev, type, quantity));
      setSales((prev) => [
        {
          id: crypto.randomUUID(),
          type,
          quantity,
          sellPrice,
          sellDate,
          walletId,
          avgPriceAtSell: agg.avgPrice,
        },
        ...prev,
      ]);
    },
    [holdings, prices],
  );

  return {
    holdings,
    sales,
    aggregates,
    totals,
    addHolding,
    updateHolding,
    deleteHolding,
    sellGold,
  };
};
