import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { fmtVND, fmtShort } from "@/lib/format";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface Props {
  data: { month: string; price: number }[];
}

export const GoldPriceChart = ({ data }: Props) => {
  const { t } = useLanguage();
  return (
    <Card className="lg:col-span-3 card-shadow">
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">
          {t("gold.priceChart")}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {t("gold.last7Months")}
        </p>
        <div className="h-50 sm:h-60">
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
                width={50}
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
                  fmtVND(value),
                  t("gold.priceLabel"),
                ]}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(45 93% 47%)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "hsl(45 93% 47%)",
                  strokeWidth: 2,
                  stroke: "hsl(var(--card))",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
