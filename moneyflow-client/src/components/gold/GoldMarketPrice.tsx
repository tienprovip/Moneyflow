import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { GOLD_TYPE_LABELS, GoldType } from "@/types/gold";

interface Props {
  prices: Record<string, { buy: number; sell: number }>;
}

export const GoldMarketPrices = ({ prices }: Props) => {
  const { t } = useLanguage();
  return (
    <Card className="lg:col-span-2 card-shadow">
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">
          {t("gold.marketPrices")}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {t("gold.todayPrices")}
        </p>
        <div className="space-y-3">
          {Object.entries(prices).map(([type, p]) => (
            <div
              key={type}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 gap-3"
            >
              <div className="flex items-center gap-3 flex-1">
                <p className="text-sm font-medium text-foreground">{GOLD_TYPE_LABELS[type as GoldType] ?? type}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">
                  {t("gold.buy")}:{" "}
                  <span className="font-medium text-foreground">
                    {(p.buy / 1e6).toFixed(2)}M
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("gold.sell")}:{" "}
                  <span className="font-medium text-foreground">
                    {(p.sell / 1e6).toFixed(2)}M
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
