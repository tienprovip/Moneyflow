import React from "react";
import { TrendingUp } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Line, LineChart, ResponsiveContainer } from "recharts";

const goldTrend = [
  { day: "T2", price: 92500000 },
  { day: "T3", price: 93200000 },
  { day: "T4", price: 92800000 },
  { day: "T5", price: 93500000 },
  { day: "T6", price: 94100000 },
  { day: "T7", price: 93900000 },
  { day: "CN", price: 94500000 },
];

const fmtVND = (v: number) => v.toLocaleString("vi-VN") + "₫";

const GoldSection = () => {
  const { t } = useLanguage();

  return (
    <div
      className="bg-card rounded-lg p-5 card-shadow animate-fade-in"
      style={{ animationDelay: "440ms" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("gold.title")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("gold.dashUpdated")}
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-positive">
          <TrendingUp className="w-3.5 h-3.5" />
          +2.3%
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-lg bg-primary/5 p-3.5">
          <p className="text-xs text-muted-foreground mb-1">{t("gold.buy")}</p>
          <p className="text-base sm:text-lg text-money text-foreground">
            94.500.000₫
          </p>
          <p className="text-xs text-positive mt-0.5">+600.000₫</p>
        </div>
        <div className="rounded-lg bg-gold-muted p-3.5">
          <p className="text-xs text-muted-foreground mb-1">{t("gold.sell")}</p>
          <p className="text-base sm:text-lg text-money text-foreground">
            94.200.000₫
          </p>
          <p className="text-xs text-positive mt-0.5">+450.000₫</p>
        </div>
      </div>
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={goldTrend}>
            <Line
              type="monotone"
              dataKey="price"
              stroke="hsl(45 93% 47%)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between mt-1">
        {goldTrend.map((d) => (
          <span key={d.day} className="text-[10px] text-muted-foreground">
            {d.day}
          </span>
        ))}
      </div>
    </div>
  );
};

export default GoldSection;
