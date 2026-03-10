import { useLanguage } from "@/hooks/use-language";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const AllocationChart = () => {
  const { t } = useLanguage();

  const data = [
    {
      name: t("allocation.cash"),
      value: 1130750000,
      fill: "hsl(var(--primary))",
    },
    {
      name: t("allocation.stocks"),
      value: 1571000000,
      fill: "hsl(217 91% 60%)",
    },
    { name: t("allocation.gold"), value: 508250000, fill: "hsl(45 93% 47%)" },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);
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
                data={data}
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
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.fill }}
            ></div>
            <span className="text-muted-foreground">{item.name}</span>
            <span className="font-semibold text-foreground">
              {((item.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllocationChart;
