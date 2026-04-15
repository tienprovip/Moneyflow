import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import {
  shouldCountAsExpense,
  shouldCountAsIncome,
} from "@/lib/transaction-report";
import { Transaction } from "@/types/transaction";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { memo, useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const VND_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const EMPTY_TOTALS = {
  balance: 0,
  expense: 0,
  income: 0,
};

function formatVND(amount: number) {
  return VND_FORMATTER.format(amount);
}

function formatMonthLabel(ym: string): string {
  const [year, month] = ym.split("-");
  return `T${Number.parseInt(month)}/${year}`;
}

interface SummaryCardsProps {
  allTransactions: Transaction[];
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

  transactions.forEach((transaction) => {
    const day = transaction.date.slice(5);
    if (shouldCountAsIncome(transaction)) {
      incomeMap[day] = (incomeMap[day] || 0) + transaction.amount;
    }

    if (shouldCountAsExpense(transaction)) {
      expenseMap[day] = (expenseMap[day] || 0) + transaction.amount;
    }
  });

  const allDays = [...new Set(transactions.map((item) => item.date.slice(5)))]
    .sort()
    .slice(-7);

  const formatDay = (day: string) => {
    const [month, date] = day.split("-");
    return `${Number.parseInt(date)}/${Number.parseInt(month)}`;
  };

  return {
    balance: allDays.map((day) => ({
      day: formatDay(day),
      v: (incomeMap[day] || 0) - (expenseMap[day] || 0),
    })),
    expense: allDays.map((day) => ({
      day: formatDay(day),
      v: expenseMap[day] || 0,
    })),
    income: allDays.map((day) => ({
      day: formatDay(day),
      v: incomeMap[day] || 0,
    })),
  };
}

function getPreviousMonth(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(year, monthIndex - 1, 1);
  date.setMonth(date.getMonth() - 1);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function calculatePercentChange(current: number, previous: number) {
  if (previous === 0) {
    if (current === 0) return 0;
    return 100;
  }

  return ((current - previous) / Math.abs(previous)) * 100;
}

function formatPercentChange(value: number) {
  const roundedValue = Number.isFinite(value) ? value : 0;
  const sign = roundedValue > 0 ? "+" : "";

  return `${sign}${roundedValue.toFixed(1)}%`;
}

const MiniLineChart = memo(function MiniLineChart({
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
          tickFormatter={(value) =>
            value >= 1000000
              ? `${(value / 1000000).toFixed(0)}M`
              : value >= 1000
                ? `${(value / 1000).toFixed(0)}K`
                : value
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
});

const SummaryCards = memo(function SummaryCards({
  allTransactions,
  totalIncome,
  totalExpense,
  selectedMonth,
  onMonthChange,
  availableMonths,
  transactions,
}: SummaryCardsProps) {
  const { t } = useLanguage();
  const balance = totalIncome - totalExpense;

  const dailyData = useMemo(() => buildDailyData(transactions), [transactions]);

  const monthlyTotals = useMemo(() => {
    const totals = new Map<string, typeof EMPTY_TOTALS>();

    allTransactions.forEach((transaction) => {
      const monthKey = transaction.date.slice(0, 7);
      const currentTotals = totals.get(monthKey) ?? { ...EMPTY_TOTALS };

      if (shouldCountAsIncome(transaction)) {
        currentTotals.income += transaction.amount;
      }

      if (shouldCountAsExpense(transaction)) {
        currentTotals.expense += transaction.amount;
      }

      currentTotals.balance = currentTotals.income - currentTotals.expense;
      totals.set(monthKey, currentTotals);
    });

    return totals;
  }, [allTransactions]);

  const changeMetrics = useMemo(() => {
    const currentMonth =
      selectedMonth === "all" ? availableMonths[0] : selectedMonth;

    if (!currentMonth) {
      return EMPTY_TOTALS;
    }

    const previousMonth = getPreviousMonth(currentMonth);
    const currentTotals = monthlyTotals.get(currentMonth) ?? EMPTY_TOTALS;
    const previousTotals = monthlyTotals.get(previousMonth) ?? EMPTY_TOTALS;

    return {
      balance: calculatePercentChange(
        currentTotals.balance,
        previousTotals.balance,
      ),
      expense: calculatePercentChange(
        currentTotals.expense,
        previousTotals.expense,
      ),
      income: calculatePercentChange(
        currentTotals.income,
        previousTotals.income,
      ),
    };
  }, [availableMonths, monthlyTotals, selectedMonth]);

  const cards = useMemo(
    () => [
      {
        amount: balance,
        change: formatPercentChange(changeMetrics.balance),
        changePositive: changeMetrics.balance >= 0,
        icon: Wallet,
        iconClass: "bg-primary/10 text-primary",
        spark: dailyData.balance,
        sparkColor: "hsl(160, 84%, 39%)",
        title: t("summary.balance"),
      },
      {
        amount: totalIncome,
        change: formatPercentChange(changeMetrics.income),
        changePositive: changeMetrics.income >= 0,
        icon: TrendingUp,
        iconClass:
          "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
        spark: dailyData.income,
        sparkColor: "hsl(160, 84%, 39%)",
        title: t("summary.income"),
      },
      {
        amount: totalExpense,
        change: formatPercentChange(changeMetrics.expense),
        changePositive: changeMetrics.expense <= 0,
        icon: TrendingDown,
        iconClass:
          "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
        spark: dailyData.expense,
        sparkColor: "hsl(0, 72%, 51%)",
        title: t("summary.expense"),
      },
    ],
    [balance, changeMetrics, dailyData, t, totalExpense, totalIncome],
  );

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-end">
        <Select value={selectedMonth} onValueChange={onMonthChange}>
          <SelectTrigger className="h-8 w-35 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("summary.allTime")}</SelectItem>
            {availableMonths.map((month) => (
              <SelectItem key={month} value={month}>
                {formatMonthLabel(month)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <Card
            key={card.title}
            className="card-shadow transition-shadow duration-200 hover:card-shadow-hover"
          >
            <CardContent className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconClass}`}
                  >
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="mt-0.5 text-lg font-bold text-foreground text-money">
                      {formatVND(card.amount)}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${card.changePositive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
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
});

export default SummaryCards;
