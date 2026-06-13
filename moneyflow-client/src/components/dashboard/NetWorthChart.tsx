import { useLanguage } from "@/hooks/use-language";
import { fmtShort } from "@/lib/format";
import { DashboardNetWorthData } from "@/types/dashboard";
import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface NetWorthChartProps {
  data: DashboardNetWorthData[];
}

const NetWorthChart = ({ data }: NetWorthChartProps) => {
  const { t } = useLanguage();

  return (
    <div
      className="bg-card rounded-lg p-5 card-shadow animate-fade-in h-full"
      style={{ animationDelay: "200ms" }}
    >
      <h3 className="text-sm font-semibold text-foreground mb-1">
        {t("chart.netWorthTitle")}
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        {t("chart.last7Months")}
      </p>
      <div className="h-70 sm:h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtShort}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "13px",
                boxShadow: "0 4px 12px hsl(0 0% 0% / 0.08)",
              }}
              formatter={(value: number) => [
                `${value.toLocaleString("vi-Vn")}₫`,
                t("chart.netWorthLabel"),
              ]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                fill: "hsl(var(--primary))",
                strokeWidth: 2,
                stroke: "hsl(var(--card))",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export { NetWorthChart };
