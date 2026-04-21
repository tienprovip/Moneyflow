import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";

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
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    {type.slice(0, 2)}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground">{type}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {t("gold.buy")}:{" "}
                  <span className="font-medium text-foreground">
                    {(p.buy / 1e6).toFixed(1)}M
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("gold.sell")}:{" "}
                  <span className="font-medium text-foreground">
                    {(p.sell / 1e6).toFixed(1)}M
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
