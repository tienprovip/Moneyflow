import { useState, useMemo, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GoldType, GOLD_TYPE_LABELS } from "@/types/gold";
import { useLanguage } from "@/hooks/use-language";
import type { HistoricalPrice } from "@/api/gold";

interface Props {
  historyData: Record<string, HistoricalPrice[]>;
}

export function GoldPriceChart({ historyData }: Props) {
  const { t } = useLanguage();
  
  // Lấy danh sách các loại vàng có dữ liệu
  const availableTypes = useMemo(() => Object.keys(historyData || {}) as GoldType[], [historyData]);
  
  const [selectedType, setSelectedType] = useState<GoldType>(GoldType.KGB);

  useEffect(() => {
    if (availableTypes.length > 0 && (!selectedType || !availableTypes.includes(selectedType))) {
      setSelectedType(availableTypes.includes(GoldType.KGB) ? GoldType.KGB : availableTypes[0]);
    }
  }, [availableTypes, selectedType]);

  const chartData = useMemo(() => {
    return historyData?.[selectedType] || [];
  }, [historyData, selectedType]);

  if (!availableTypes.length || chartData.length === 0) {
    return null;
  }

  return (
    <Card className="card-shadow col-span-1 lg:col-span-3">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <CardTitle className="text-sm font-semibold text-foreground">
          {t("gold.priceChart") || "Biểu đồ giá vàng (30 ngày)"}
        </CardTitle>
        <Select
          value={selectedType}
          onValueChange={(val) => setSelectedType(val as GoldType)}
        >
          <SelectTrigger className="w-[200px] sm:w-[250px] bg-secondary/50 border-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {GOLD_TYPE_LABELS[type] || type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickLine={false} 
                axisLine={false} 
                tickMargin={10}
                className="text-muted-foreground"
              />
              <YAxis 
                domain={["auto", "auto"]} 
                tick={{ fontSize: 12 }} 
                tickFormatter={(val) => `${(val / 1e6).toFixed(1)}M`}
                tickLine={false}
                axisLine={false}
                width={50}
                className="text-muted-foreground"
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const buyEntry = payload.find((e: any) => e.name === "buy");
                    const sellEntry = payload.find((e: any) => e.name === "sell");
                    const spread = (sellEntry && buyEntry) ? sellEntry.value - buyEntry.value : null;

                    return (
                      <div className="bg-background border border-border p-3 rounded-lg shadow-md text-sm min-w-[160px]">
                        <p className="font-semibold text-foreground mb-2 pb-1 border-b border-border">{label}</p>
                        {payload.map((entry: any, index: number) => (
                          <div key={index} className="flex justify-between items-center gap-4 py-0.5">
                            <span style={{ color: entry.color }} className="font-medium">
                              {entry.name === "buy" ? t("gold.buy") : t("gold.sell")}
                            </span>
                            <span className="font-semibold text-foreground">
                              {Number(entry.value).toLocaleString("vi-VN")} đ
                            </span>
                          </div>
                        ))}
                        {spread !== null && (
                          <div className="flex justify-between items-center gap-4 py-0.5 mt-1 pt-1 border-t border-border border-dashed">
                            <span className="font-medium text-muted-foreground">Chênh lệch</span>
                            <span className="font-semibold text-orange-500">
                              {spread.toLocaleString("vi-VN")} đ
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                formatter={(value) => value === "buy" ? t("gold.buy") : t("gold.sell")}
              />
              <defs>
                <linearGradient id="colorSell" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBuy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="sell"
                name="sell"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSell)"
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="buy"
                name="buy"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorBuy)"
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
