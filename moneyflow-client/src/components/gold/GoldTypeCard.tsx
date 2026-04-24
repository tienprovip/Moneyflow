import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  HandCoins,
  ChevronRight,
} from "lucide-react";
import { fmtVND } from "@/lib/format";
import { useLanguage } from "@/hooks/use-language";
import type { GoldTypeAggregate } from "@/types/gold";
import { GOLD_TYPE_LABELS } from "@/types/gold";

interface Props {
  data: GoldTypeAggregate;
  onView: () => void;
  onBuy: () => void;
  onSell: () => void;
}

export function GoldTypeCard({ data, onView, onBuy, onSell }: Props) {
  const { t } = useLanguage();
  const isProfit = data.pl >= 0;

  return (
    <Card
      className="card-shadow hover:card-shadow-hover transition-all cursor-pointer group"
      onClick={onView}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                {GOLD_TYPE_LABELS[data.type]?.slice(0, 3) ?? data.type.slice(0, 3)}
              </span>
            </div>
            <div>
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 font-medium"
              >
                {GOLD_TYPE_LABELS[data.type] ?? data.type}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {data.buyCount} {t("gold.entries")}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">
              {t("gold.holdingQty")}
            </p>
            <p className="text-base font-bold text-foreground text-money mt-0.5">
              {data.totalQty}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                {t("gold.unit")}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {t("gold.avgPrice")}
            </p>
            <p className="text-base font-bold text-foreground text-money mt-0.5">
              {(data.avgPrice / 1e6).toFixed(2)}M
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {t("gold.currentVal")}
            </p>
            <p className="text-sm font-semibold text-foreground text-money mt-0.5">
              {fmtVND(data.currentValue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {t("gold.profitLoss")}
            </p>
            <div
              className={`flex items-center gap-1 text-sm font-semibold mt-0.5 ${isProfit ? "text-positive" : "text-negative"}`}
            >
              {isProfit ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              <span className="text-money">
                {isProfit ? "+" : ""}
                {data.plPct.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onBuy();
            }}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            {t("gold.addHolding")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs text-amber-700 dark:text-amber-400 hover:text-amber-800"
            onClick={(e) => {
              e.stopPropagation();
              onSell();
            }}
            disabled={data.totalQty <= 0}
          >
            <HandCoins className="w-3.5 h-3.5 mr-1" />
            {t("gold.sellBtn")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
