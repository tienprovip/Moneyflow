import React from "react";
import { useLanguage } from "@/hooks/use-language";
import { CategoryIcon } from "@/components/transactions/CategoryIcon";
import type { TranslationKey } from "@/i18n/translations";

const fmtVND = (value: number) => value.toLocaleString("vi-VN") + "\u20ab";

const RecentTransactions = () => {
  const { t } = useLanguage();

  const transactions = [
    {
      id: 1,
      title:
        t("recent.income") === "Thu nh\u1eadp"
          ? "L\u01b0\u01a1ng th\u00e1ng"
          : "Monthly Salary",
      category: "L\u01b0\u01a1ng",
      iconName: "Banknote",
      colorClassName:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
      amount: 35000000,
      type: "income",
      date: t("recent.today"),
    },
    {
      id: 2,
      title: t("recent.income") === "Thu nh\u1eadp" ? "Si\u00eau th\u1ecb" : "Supermarket",
      category: "\u0102n u\u1ed1ng",
      iconName: "UtensilsCrossed",
      colorClassName:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
      amount: 1250000,
      type: "expense",
      date: t("recent.today"),
    },
    {
      id: 3,
      title: t("recent.income") === "Thu nh\u1eadp" ? "C\u00e0 ph\u00ea" : "Coffee",
      category: "\u0102n u\u1ed1ng",
      iconName: "UtensilsCrossed",
      colorClassName:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
      amount: 65000,
      type: "expense",
      date: t("recent.yesterday"),
    },
    {
      id: 4,
      title:
        t("recent.income") === "Thu nh\u1eadp"
          ? "Ti\u1ec1n \u0111i\u1ec7n"
          : "Electric Bill",
      category: "H\u00f3a \u0111\u01a1n",
      iconName: "Receipt",
      colorClassName:
        "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
      amount: 850000,
      type: "expense",
      date: t("recent.yesterday"),
    },
    {
      id: 5,
      title: t("recent.income") === "Thu nh\u1eadp" ? "Nh\u00e0 h\u00e0ng" : "Restaurant",
      category: "\u0102n u\u1ed1ng",
      iconName: "UtensilsCrossed",
      colorClassName:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
      amount: 520000,
      type: "expense",
      date: "22/02",
    },
    {
      id: 6,
      title: "Freelance",
      category: "Freelance",
      iconName: "Laptop",
      colorClassName:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
      amount: 12000000,
      type: "income",
      date: "21/02",
    },
    {
      id: 7,
      title: "Grab",
      category: "Di chuy\u1ec3n",
      iconName: "Car",
      colorClassName:
        "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
      amount: 185000,
      type: "expense",
      date: "21/02",
    },
  ] as const;

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
        <button className="text-xs font-medium text-primary hover:underline">
          {t("recent.viewAll")}
        </button>
      </div>

      <div className="space-y-1">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-secondary/50"
          >
            <CategoryIcon
              category={tx.category}
              iconName={tx.iconName}
              colorClassName={tx.colorClassName}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {tx.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {tx.date} · {t(`cat.${tx.category}` as TranslationKey)}
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
        ))}
      </div>
    </div>
  );
};

export { RecentTransactions };
