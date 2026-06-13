import { useLanguage } from "@/hooks/use-language";
import { DashboardTopSpendingData } from "@/types/dashboard";

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

interface TopSpendingProps {
  data: DashboardTopSpendingData[];
}

const TopSpending = ({ data }: TopSpendingProps) => {
  const { t, locale } = useLanguage();

  const maxAmount = data.length > 0 ? data[0].amount : 1;

  const getCatName = (cat: any) => {
    if (!cat) return "Unknown";
    if (typeof cat === 'object') return cat[locale] || cat.vi || cat.en || "Unknown";
    return String(cat);
  };

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

      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">Không có dữ liệu</p>
      ) : (
        <div className="space-y-3">
          {data.map((item, i) => {
            const catName = getCatName(item.category);
            return (
              <div key={`${catName}-${i}`} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-20 truncate shrink-0">
                  {catName}
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export { TopSpending };
