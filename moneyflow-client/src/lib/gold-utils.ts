import type { GoldHolding } from "@/components/gold/GoldDialog";
import type { GoldType, GoldTypeAggregate } from "@/types/gold";

export const computeAggregates = (
  holdings: GoldHolding[],
  prices: Record<string, { buy: number; sell: number }>,
): GoldTypeAggregate[] => {
  const types = Object.keys(prices) as GoldType[];
  return types
    .map((type) => {
      const ofType = holdings.filter((h) => h.type === type);
      const totalQty = ofType.reduce((sum, h) => sum + h.quantity, 0);
      const totalCost = ofType.reduce(
        (sum, h) => sum + h.quantity * h.purchasePrice,
        0,
      );
      const avgPrice = totalQty > 0 ? totalCost / totalQty : 0;
      const currentPrice = prices[type]?.sell ?? 0;
      const currentValue = totalQty * currentPrice;
      const pl = currentValue - totalCost;
      const plPct = totalCost > 0 ? (pl / totalCost) * 100 : 0;
      return {
        type,
        totalQty,
        avgPrice,
        totalCost,
        currentPrice,
        currentValue,
        pl,
        plPct,
        buyCount: ofType.length,
      };
    })
    .filter((a) => a.buyCount > 0 || a.totalQty > 0);
};

/** Reduce holdings of a given type by `quantity` using FIFO (oldest first). */
export const reduceHoldingsFIFO = (
  holdings: GoldHolding[],
  type: GoldType,
  quantity: number,
): GoldHolding[] => {
  let remaining = quantity;
  const sorted = [...holdings].sort((a, b) => {
    if (a.type !== type && b.type !== type) return 0;
    if (a.type !== type) return -1;
    if (b.type !== type) return 1;
    return (
      new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()
    );
  });
  const next: GoldHolding[] = [];
  for (const h of sorted) {
    if (h.type !== type || remaining <= 0) {
      next.push(h);
      continue;
    }
    if (h.quantity <= remaining) {
      remaining -= h.quantity;
    } else {
      next.push({ ...h, quantity: h.quantity - remaining });
      remaining = 0;
    }
  }
  return next;
};
