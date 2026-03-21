import {
  Wallet,
  TrendingUp,
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

const accentStyles = {
  primary: "bg-primary/10 text-primary",
  "chart-blue": "bg-chart-blue/10 text-chart-blue",
  gold: "bg-gold/10 text-gold",
};

export function AssetCards() {
  const { t } = useLanguage();

  const assets = [
    {
      title: t("asset.cash"),
      value: "1.130.750.000₫",
      change: "+2,1%",
      positive: true,
      icon: Wallet,
      accent: "primary" as const,
    },
    {
      title: t("asset.stocks"),
      value: "1.571.000.000₫",
      change: "+18,7%",
      positive: true,
      icon: TrendingUp,
      accent: "chart-blue" as const,
    },
    {
      title: t("asset.gold"),
      value: "508.250.000₫",
      change: "-1,3%",
      positive: false,
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
