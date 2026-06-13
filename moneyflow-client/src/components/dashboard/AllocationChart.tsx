import { useLanguage } from "@/hooks/use-language";
import { DashboardAllocationData } from "@/types/dashboard";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { TranslationKey } from "@/i18n/translations";

interface AllocationChartProps {
  data: DashboardAllocationData[];
}

const colorMap: Record<string, string> = {
  Cash: "hsl(var(--primary))",
  Stocks: "hsl(217 91% 60%)",
  Gold: "hsl(45 93% 47%)",
};

const AllocationChart = ({ data }: AllocationChartProps) => {
  const { t } = useLanguage();

  const formattedData = data.map((item) => ({
    name: t(`allocation.${item.name.toLowerCase()}` as TranslationKey) || item.name,
    value: item.value,
    fill: colorMap[item.name] || "hsl(var(--primary))",
  }));

  const total = formattedData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div
      className="bg-card rounded-lg p-5 card-shadow animate-fade-in h-full flex flex-col"
      style={{ animationDelay: "280ms" }}
    >
      <h3 className="text-sm font-semibold text-foreground mb-1">
        {t("allocation.title")}
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        {t("allocation.subtitle")}
      </p>
      <div className="h-45">
        <ResponsiveContainer width="100%" height="100%">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "13px",
                }}
                formatter={(value: number) => [
                  `${value.toLocaleString("vi-VN")}₫`,
                  "",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-2">
        {formattedData.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.fill }}
            ></div>
            <span className="text-muted-foreground">{item.name}</span>
            <span className="font-semibold text-foreground">
              {total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { AllocationChart };
