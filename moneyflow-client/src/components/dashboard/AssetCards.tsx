import {
  Wallet,
  TrendingUp,
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { DashboardSummaryResponse } from "@/types/dashboard";
import { fmtVND } from "@/lib/format";

const accentStyles = {
  primary: "bg-primary/10 text-primary",
  "chart-blue": "bg-chart-blue/10 text-chart-blue",
  gold: "bg-gold/10 text-gold",
};

interface AssetCardsProps {
  data: DashboardSummaryResponse["assets"];
}

export function AssetCards({ data }: AssetCardsProps) {
  const { t } = useLanguage();

  const assets = [
    {
      title: t("asset.cash"),
      value: fmtVND(data.cash.value),
      change: `${data.cash.change >= 0 ? "+" : ""}${data.cash.change}%`,
      positive: data.cash.change >= 0,
      icon: Wallet,
      accent: "primary" as const,
    },
    {
      title: t("asset.stocks"),
      value: fmtVND(data.stocks.value),
      change: `${data.stocks.change >= 0 ? "+" : ""}${data.stocks.change}%`,
      positive: data.stocks.change >= 0,
      icon: TrendingUp,
      accent: "chart-blue" as const,
    },
    {
      title: t("asset.gold"),
      value: fmtVND(data.gold.value),
      change: `${data.gold.change >= 0 ? "+" : ""}${data.gold.change}%`,
      positive: data.gold.change >= 0,
      icon: CircleDollarSign,
      accent: "gold" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
      {assets.map((asset, i) => (
        <div
          key={asset.title}
          className="bg-card rounded-lg p-5 card-shadow hover:card-shadow-hover transition-shadow duration-200 animate-fade-in"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${accentStyles[asset.accent]}`}
            >
              <asset.icon className="w-5 h-5" />
            </div>
            <div
              className={`flex items-center gap-1 text-xs font-semibold ${asset.positive ? "text-positive" : "text-negative"}`}
            >
              {asset.positive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {asset.change}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">{asset.title}</p>
          <p className="text-xl sm:text-2xl text-money text-foreground">
            {asset.value}
          </p>
        </div>
      ))}
    </div>
  );
}
