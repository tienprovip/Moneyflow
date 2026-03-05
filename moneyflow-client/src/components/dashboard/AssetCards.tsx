import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  TrendingUp,
  Wallet,
} from "lucide-react";
import React from "react";

const assets = [
  {
    title: "Tiền mặt",
    value: "10.000.000đ",
    change: "+5%",
    positive: true,
    icon: Wallet,
    accent: "primary" as const,
  },
  {
    title: "Danh mục cổ phiếu",
    value: "10.500.000đ",
    change: "-5%",
    positive: false,
    icon: TrendingUp,
    accent: "chart-blue" as const,
  },
  {
    title: "Giá trị vàng",
    value: "10.000.000đ",
    change: "+5%",
    positive: true,
    icon: CircleDollarSign,
    accent: "gold" as const,
  },
];

const accentStyles = {
  primary: "bg-primary/10 text-primary",
  "chart-blue": "bg-chart-blue/10 text-chart-blue",
  gold: "bg-gold/10 text-gold",
};

const AssetCards = () => {
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
};

export default AssetCards;
