import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { GoldApiResponse } from "@/types/gold";
import { DashboardGoldTrendData } from "@/types/dashboard";

const fmtVND = (v: number) => v.toLocaleString("vi-VN") + "₫";

interface GoldSectionProps {
  data: GoldApiResponse[];
  trend?: DashboardGoldTrendData[];
}

const GoldSection = ({ trend = [] }: GoldSectionProps) => {
  const { t } = useLanguage();

  const currentDay = trend.length > 0 ? trend[trend.length - 1] : null;
  const prevDay = trend.length > 1 ? trend[trend.length - 2] : null;

  const buyDiff = currentDay && prevDay ? currentDay.buy - prevDay.buy : 0;
  const sellDiff = currentDay && prevDay ? currentDay.sell - prevDay.sell : 0;
  const percentChange = prevDay && prevDay.buy > 0 ? (buyDiff / prevDay.buy) * 100 : 0;

  return (
    <div
      className="bg-card rounded-lg p-5 card-shadow animate-fade-in flex flex-col"
      style={{ animationDelay: "440ms" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Giá vàng SJC
          </h3>
          <p className="text-xs text-muted-foreground">
            Cập nhật hôm nay
          </p>
        </div>
        {currentDay && percentChange !== 0 && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${percentChange > 0 ? "text-positive" : "text-negative"}`}>
            {percentChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {percentChange > 0 ? "+" : ""}{percentChange.toFixed(1).replace('.', ',')}%
          </div>
        )}
      </div>

      {trend.length === 0 ? (
         <div className="h-24 flex items-center justify-center">
           <span className="text-xs text-muted-foreground">Không có dữ liệu</span>
         </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="rounded-lg bg-teal-50 dark:bg-teal-950/30 p-3.5">
              <p className="text-xs text-muted-foreground mb-1">Mua vào</p>
              <p className="text-base sm:text-lg font-bold text-foreground mb-1">
                {fmtVND(currentDay?.buy || 0)}
              </p>
              <p className={`text-xs ${buyDiff >= 0 ? "text-positive" : "text-negative"}`}>
                {buyDiff > 0 ? "+" : ""}{fmtVND(buyDiff)}
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3.5">
              <p className="text-xs text-muted-foreground mb-1">Bán ra</p>
              <p className="text-base sm:text-lg font-bold text-foreground mb-1">
                {fmtVND(currentDay?.sell || 0)}
              </p>
              <p className={`text-xs ${sellDiff >= 0 ? "text-positive" : "text-negative"}`}>
                {sellDiff > 0 ? "+" : ""}{fmtVND(sellDiff)}
              </p>
            </div>
          </div>
          
          <div className="h-16 w-full mt-2 relative">
            <div className="absolute bottom-0 w-full h-[1px] bg-amber-400" />
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <Line
                  type="monotone"
                  dataKey="buy"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-2 px-1">
            {trend.map((d) => (
              <span key={d.date} className="text-[10px] text-muted-foreground">
                {d.date}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export { GoldSection };
