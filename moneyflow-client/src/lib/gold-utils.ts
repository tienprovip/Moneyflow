import type { GoldHolding, GoldType, GoldTypeAggregate } from "@/types/gold";

/**
 * Tính aggregates cho từng loại vàng từ danh sách holdings.
 * Chủ yếu dùng cho compatibility — hook mới tính trực tiếp từ API response.
 */
export const computeAggregates = (
  holdings: GoldHolding[],
  prices: Record<string, { buy: number; sell: number }>,
): GoldTypeAggregate[] => {
  const typeMap = new Map<GoldType, GoldHolding[]>();
  for (const h of holdings) {
    const arr = typeMap.get(h.type) ?? [];
    arr.push(h);
    typeMap.set(h.type, arr);
  }

  const result: GoldTypeAggregate[] = [];
  for (const [type, ofType] of typeMap.entries()) {
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
    result.push({
      goldId: ofType[0]?.goldId ?? "",
      type,
      totalQty,
      avgPrice,
      totalCost,
      currentPrice,
      currentValue,
      pl,
      plPct,
      buyCount: ofType.length,
      status: "holding",
    });
  }
  return result;
};
