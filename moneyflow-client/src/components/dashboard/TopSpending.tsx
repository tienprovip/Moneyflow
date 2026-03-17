import { useLanguage } from "@/hooks/use-language";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(217 91% 60%)",
  "hsl(45 93% 47%)",
  "hsl(142 71% 45%)",
  "hsl(0 84% 60%)",
  "hsl(270 67% 58%)",
];

const fmtVND = (v: number) => {
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
  return v.toLocaleString("vi-VN");
};

const TopSpending = () => {
  const { t } = useLanguage();

  const data = [
    { category: t("spending.food"), amount: 4850000 },
    { category: t("spending.bills"), amount: 9650000 },
    { category: t("spending.shopping"), amount: 3200000 },
    { category: t("spending.transport"), amount: 1850000 },
    { category: t("spending.entertainment"), amount: 1200000 },
    { category: t("spending.health"), amount: 800000 },
  ].sort((a, b) => b.amount - a.amount);

  const maxAmount = data[0].amount ?? 1;

  return (
    <div
      className="bg-card rounded-lg p-5 card-shadow animate-fade-in"
      style={{ animationDelay: "560ms" }}
    >
      <h3 className="text-sm font-semibold text-foreground mb-1">
        {t("spending.title")}
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        {t("spending.subtitle")}
      </p>

      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={item.category} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-20 truncate shrink-0">
              {item.category}
            </span>
            <div className="flex-1 h-7 bg-secondary/50 rounded-md overflow-hidden relative">
              <div
                className="h-full rounded-md transition-all duration-500"
                style={{
                  width: `${(item.amount / maxAmount) * 100}%`,
                  backgroundColor: COLORS[i % COLORS.length],
                  opacity: 0.85,
                }}
              />
            </div>
            <span className="text-xs font-semibold text-foreground w-16 text-right shrink-0">
              {fmtVND(item.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSpending;
