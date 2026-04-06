import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import { Transaction } from "@/types/transaction";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}
function formatMonthLabel(ym: string): string {
  const [year, month] = ym.split("-");
  return `T${Number.parseInt(month)}/${year}`;
}

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  availableMonths: string[];
  transactions: Transaction[];
}

function buildDailyData(transactions: Transaction[]) {
  const incomeMap: Record<string, number> = {};
  const expenseMap: Record<string, number> = {};

  transactions.forEach((t) => {
    const day = t.date.slice(5); // "MM-DD"
    if (t.type === "income") {
      incomeMap[day] = (incomeMap[day] || 0) + t.amount;
    } else {
      expenseMap[day] = (expenseMap[day] || 0) + t.amount;
    }
  });

  const allDays = [...new Set(transactions.map((t) => t.date.slice(5)))]
    .sort()
    .slice(-7);

  const formatDay = (d: string) => {
    const [m, dd] = d.split("-");
    return `${Number.parseInt(dd)}/${Number.parseInt(m)}`;
  };

  return {
    income: allDays.map((d) => ({ day: formatDay(d), v: incomeMap[d] || 0 })),
    expense: allDays.map((d) => ({ day: formatDay(d), v: expenseMap[d] || 0 })),
    balance: allDays.map((d) => ({
      day: formatDay(d),
      v: (incomeMap[d] || 0) - (expenseMap[d] || 0),
    })),
  };
}

function MiniLineChart({
  data,
  color,
  label,
}: {
  data: { day: string; v: number }[];
  color: string;
  label: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          vertical={false}
        />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            v >= 1000000
              ? `${(v / 1000000).toFixed(0)}M`
              : v >= 1000
                ? `${(v / 1000).toFixed(0)}K`
                : v
          }
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number) => [formatVND(value), label]}
        />
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
          activeDot={{
            r: 4,
            fill: color,
            strokeWidth: 2,
            stroke: "hsl(var(--card))",
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

const SummaryCards = ({
  totalIncome,
  totalExpense,
  selectedMonth,
  onMonthChange,
  availableMonths,
  transactions,
}: SummaryCardsProps) => {
  const { t } = useLanguage();
  const balance = totalIncome - totalExpense;

  const dailyData = useMemo(() => buildDailyData(transactions), [transactions]);

  const cards = [
    {
      title: t("summary.balance"),
      amount: balance,
      change: "+12.5%",
      changePositive: true,
      icon: Wallet,
      iconClass: "bg-primary/10 text-primary",
      spark: dailyData.balance,
      sparkColor: "hsl(160, 84%, 39%)",
    },
    {
      title: t("summary.income"),
      amount: totalIncome,
      change: "+8.2%",
      changePositive: true,
      icon: TrendingUp,
      iconClass:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
      spark: dailyData.income,
      sparkColor: "hsl(160, 84%, 39%)",
    },
    {
      title: t("summary.expense"),
      amount: totalExpense,
      change: "+3.1%",
      changePositive: false,
      icon: TrendingDown,
      iconClass: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      spark: dailyData.expense,
      sparkColor: "hsl(0, 72%, 51%)",
    },
  ];
  return (
    <div className="mb-6">
      <div className="flex items-center justify-end mb-3">
        <Select value={selectedMonth} onValueChange={onMonthChange}>
          <SelectTrigger className="w-35 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("summary.allTime")}</SelectItem>
            {availableMonths.map((m) => (
              <SelectItem key={m} value={m}>
                {formatMonthLabel(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {cards.map((card) => (
          <Card
            key={card.title}
            className="card-shadow hover:card-shadow-hover transition-shadow duration-200"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconClass}`}
                  >
                    <card.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-lg font-bold text-foreground text-money mt-0.5">
                      {formatVND(card.amount)}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${card.changePositive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
                >
                  {card.change}
                </span>
              </div>
              <MiniLineChart
                data={card.spark}
                color={card.sparkColor}
                label={card.title}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SummaryCards;
