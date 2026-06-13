import React from "react";
import { useLanguage } from "@/hooks/use-language";
import { CategoryIcon } from "@/components/transactions/CategoryIcon";
import type { TranslationKey } from "@/i18n/translations";
import { Transaction } from "@/types/transaction";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const fmtVND = (value: number) => value.toLocaleString("vi-VN") + "\u20ab";

interface RecentTransactionsProps {
  data: Transaction[];
}

const RecentTransactions = ({ data }: RecentTransactionsProps) => {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();

  const getCatName = (tx: any) => {
    const cat = tx.categoryId?.name || tx.category;
    if (!cat) return "Unknown";
    if (typeof cat === 'object') return cat[locale] || cat.vi || cat.en || "Unknown";
    return String(cat);
  };

  return (
    <div
      className="bg-card rounded-lg p-5 card-shadow animate-fade-in"
      style={{ animationDelay: "520ms" }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("recent.title")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("recent.last7Days")}
          </p>
        </div>
        <button
          onClick={() => navigate("/transactions")}
          className="text-xs font-medium text-primary hover:underline"
        >
          {t("recent.viewAll")}
        </button>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Không có dữ liệu</p>
      ) : (
        <div className="space-y-1">
          {data.map((tx) => {
            const catName = getCatName(tx);
            const iconName = (tx as any).categoryId?.icon || tx.categoryIcon || "Circle";
            const colorName = (tx as any).categoryId?.color || tx.categoryColor || "bg-slate-100 text-slate-500";
            return (
              <div
                key={tx.id || (tx as any)._id}
                className="flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-secondary/50"
              >
                <CategoryIcon
                  category={catName}
                  iconName={iconName}
                  colorClassName={colorName}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {tx.name || (tx as any).title || "Giao dịch"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(tx.date), "dd/MM/yyyy")} · {catName}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={`text-xs font-semibold sm:text-sm ${tx.type === "income" ? "text-positive" : "text-negative"}`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {fmtVND(tx.amount)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export { RecentTransactions };
