import mongoose from "mongoose";
import AccountModel from "../account/account.model";
import StockModel, { StockStatus } from "../stock/stock.model";
import GoldModel, { GoldStatus, GoldType } from "../gold/gold.model";
import TransactionModel, { TransactionType } from "../transaction/transaction.model";
import { settleDueSavingsForUser } from "../account/account.service";
import { goldScraperService } from "../gold/gold-scraper.service";

const getMonthLabel = (date: Date) => `Tháng ${date.getMonth() + 1}`;

const getLastSevenMonthStarts = (date = new Date()) => {
  const months: Date[] = [];
  const currentMonth = new Date(date.getFullYear(), date.getMonth(), 1);

  for (let offset = 6; offset >= 0; offset -= 1) {
    months.push(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - offset, 1),
    );
  }

  return months;
};

const getTransactionCashImpact = (transaction: { type: TransactionType; amount: number }) => {
  if (transaction.type === TransactionType.INCOME) return transaction.amount;
  if (transaction.type === TransactionType.EXPENSE) return -transaction.amount;
  return 0;
};

const buildNetWorthChart = (
  totalNetWorth: number,
  transactions: { type: TransactionType; amount: number; date: Date }[],
) => {
  const months = getLastSevenMonthStarts();

  return months.map((monthStart, index) => {
    const nextMonthStart =
      index === months.length - 1
        ? new Date()
        : months[index + 1];
    const futureCashImpact = transactions.reduce((sum, transaction) => {
      if (transaction.date <= nextMonthStart) return sum;
      return sum + getTransactionCashImpact(transaction);
    }, 0);

    return {
      month: getMonthLabel(monthStart),
      value: Math.max(0, Math.round(totalNetWorth - futureCashImpact)),
    };
  });
};

export const getDashboardSummaryService = async (userId: string) => {
  // Settle savings first to ensure cash balances are up to date
  await settleDueSavingsForUser(userId);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Run all queries in parallel
  const [
    accounts,
    stocks,
    golds,
    recentTransactions,
    topSpendingRaw,
    chartTransactions,
    goldHistory,
    goldMarketPrices,
  ] = await Promise.all([
    AccountModel.find({ userId }),
    StockModel.find({ userId, status: StockStatus.HOLDING }).populate("primaryAccountId", "name type"),
    GoldModel.find({ userId, status: GoldStatus.HOLDING }).populate("primaryAccountId", "name type"),
    TransactionModel.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(6)
      .populate("accountId", "name type")
      .populate("toAccountId", "name type")
      .populate("categoryId", "name type icon color isDefault"),
    TransactionModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: TransactionType.EXPENSE,
          date: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: "$categoryId",
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 4 },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
    ]),
    TransactionModel.find({
      userId,
      date: { $gte: getLastSevenMonthStarts()[0] },
    }).select("type amount date"),
    goldScraperService.getMarketHistory().catch(() => ({})),
    goldScraperService.getMarketPrices().catch(() => ({})),
  ]);

  // Extract SJC 7 days trend
  const sjcHistory = (goldHistory as Record<string, any>)[GoldType.SJC9999] || [];
  const goldTrend = sjcHistory.slice(-7);

  // Aggregate Total Values
  const totalCash = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const totalStock = stocks.reduce((sum, stock) => sum + (stock.totalCostBasis || 0), 0);
  const totalGold = golds.reduce((sum, gold) => {
    const marketPrice = (goldMarketPrices as Record<string, { buy?: number }>)[gold.goldType]?.buy;
    const currentValue =
      marketPrice && marketPrice > 0
        ? Math.round((gold.totalWeight || 0) * marketPrice)
        : gold.totalCostBasis || 0;

    return sum + currentValue;
  }, 0);
  const totalNetWorth = totalCash + totalStock + totalGold;

  const netWorthChart = buildNetWorthChart(totalNetWorth, chartTransactions);

  const topSpending = topSpendingRaw.map((item) => ({
    category: item.category.name,
    amount: item.totalAmount,
    icon: item.category.icon,
    color: item.category.color,
  }));

  const allocation = [
    { name: "Cash", value: totalCash },
    { name: "Stocks", value: totalStock },
    { name: "Gold", value: totalGold },
  ].filter(item => item.value > 0);

  return {
    assets: {
      cash: { value: totalCash, change: 0 }, // Percent change could be calculated if we tracked history
      stocks: { value: totalStock, change: 0 },
      gold: { value: totalGold, change: 0 },
    },
    netWorthChart,
    allocation,
    topSpending,
    goldTrend,
    goldHoldings: golds,
    topStocks: stocks.slice(0, 5), // Return top 5 stocks
    recentTransactions,
  };
};
