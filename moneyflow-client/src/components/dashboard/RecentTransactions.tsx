import React from "react";
import { useLanguage } from "@/hooks/use-language";
import { CategoryIcon } from "@/components/transactions/CategoryIcon";
import type { TranslationKey } from "@/i18n/translations";
const fmtVND = (v: number) => v.toLocaleString("vi-Vn") + "₫";

const RecentTransactions = () => {
  const { t } = useLanguage();

  const transactions = [
    {
      id: 1,
      title:
        t("recent.income") === "Thu nhập" ? "Lương tháng" : "Monthly Salary",
      category: "Lương",
      amount: 35000000,
      type: "income",
      date: t("recent.today"),
    },
    {
      id: 2,
      title: t("recent.income") === "Thu nhập" ? "Siêu thị" : "Supermarket",
      category: "Ăn uống",
      amount: 1250000,
      type: "expense",
      date: t("recent.today"),
    },
    {
      id: 3,
      title: t("recent.income") === "Thu nhập" ? "Cà phê" : "Coffee",
      category: "Ăn uống",
      amount: 65000,
      type: "expense",
      date: t("recent.yesterday"),
    },
    {
      id: 4,
      title: t("recent.income") === "Thu nhập" ? "Tiền điện" : "Electric Bill",
      category: "Hóa đơn",
      amount: 850000,
      type: "expense",
      date: t("recent.yesterday"),
    },
    {
      id: 5,
      title: t("recent.income") === "Thu nhập" ? "Nhà hàng" : "Restaurant",
      category: "Ăn uống",
      amount: 520000,
      type: "expense",
      date: "22/02",
    },
    {
      id: 6,
      title: "Freelance",
      category: "Freelance",
      amount: 12000000,
      type: "income",
      date: "21/02",
    },
    {
      id: 7,
      title: "Grab",
      category: "Di chuyển",
      amount: 185000,
      type: "expense",
      date: "21/02",
    },
  ];
  return (
    <div
      className="bg-card rounded-lg p-5 card-shadow animate-fade-in"
      style={{ animationDelay: "520ms" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("recent.title")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("recent.last7Days")}
          </p>
        </div>
        <button className="text-xs font-medium text-primary hover:underline">
          {t("recent.viewAll")}
        </button>
      </div>

      <div className="space-y-1">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <CategoryIcon category={tx.category} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {tx.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {tx.date} · {t(`cat.${tx.category}` as TranslationKey)}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p
                className={`text-xs sm:text-sm font-semibold ${tx.type === "income" ? "text-positive" : "text-negative"}`}
              >
                {tx.type === "income" ? "+" : "-"}
                {fmtVND(tx.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { RecentTransactions };
