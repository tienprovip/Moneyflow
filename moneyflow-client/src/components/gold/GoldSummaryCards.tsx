import { Card, CardContent } from "@/components/ui/card";
import { fmtVND } from "@/lib/format";
import { useLanguage } from "@/hooks/use-language";
import {
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Coins,
} from "lucide-react";

interface Props {
  totalSpent: number;
  currentValue: number;
  totalQuantity: number;
  profitLoss: number;
  profitPct: string;
  typesCount: number;
}

export const GoldSummaryCards = ({
  totalSpent,
  currentValue,
  totalQuantity,
  profitLoss,
  profitPct,
  typesCount,
}: Props) => {
  const { t } = useLanguage();
  const isProfit = profitLoss >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <Card className="card-shadow hover:card-shadow-hover transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            {t("gold.totalSpent")}
          </p>
          <p className="text-lg font-bold text-foreground text-money mt-0.5">
            {fmtVND(totalSpent)}
          </p>
        </CardContent>
      </Card>

      <Card className="card-shadow hover:card-shadow-hover transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CircleDollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isProfit ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
            >
              {isProfit ? "+" : ""}
              {profitPct}%
            </span>
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            {t("gold.currentValue")}
          </p>
          <p className="text-lg font-bold text-foreground text-money mt-0.5">
            {fmtVND(currentValue)}
          </p>
        </CardContent>
      </Card>

      <Card className="card-shadow hover:card-shadow-hover transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${isProfit ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
            >
              {isProfit ? (
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div
              className={`flex items-center gap-1 text-xs font-semibold ${isProfit ? "text-positive" : "text-negative"}`}
            >
              {isProfit ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {isProfit ? "+" : ""}
              {profitPct}%
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            {t("gold.profitLoss")}
          </p>
          <p
            className={`text-lg font-bold text-money mt-0.5 ${isProfit ? "text-positive" : "text-negative"}`}
          >
            {isProfit ? "+" : ""}
            {fmtVND(profitLoss)}
          </p>
        </CardContent>
      </Card>

      <Card className="card-shadow hover:card-shadow-hover transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            {t("gold.totalQty")}
          </p>
          <p className="text-lg font-bold text-foreground text-money mt-0.5">
            {totalQuantity} {t("gold.unit")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {typesCount} {t("gold.totalCount")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
