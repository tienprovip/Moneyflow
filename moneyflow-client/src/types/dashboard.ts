import { Transaction } from "./transaction";
import { StockApiResponse } from "./stock";
import { GoldApiResponse } from "./gold";

export interface DashboardAssetSummary {
  value: number;
  change: number;
}

export interface DashboardNetWorthData {
  month: string;
  value: number;
}

export interface DashboardAllocationData {
  name: string;
  value: number;
}

export interface DashboardTopSpendingData {
  category: string;
  amount: number;
  icon?: string;
  color?: string;
}

export interface DashboardGoldTrendData {
  date: string;
  buy: number;
  sell: number;
}

export interface DashboardSummaryResponse {
  assets: {
    cash: DashboardAssetSummary;
    stocks: DashboardAssetSummary;
    gold: DashboardAssetSummary;
  };
  netWorthChart: DashboardNetWorthData[];
  allocation: DashboardAllocationData[];
  topSpending: DashboardTopSpendingData[];
  goldTrend: DashboardGoldTrendData[];
  goldHoldings: GoldApiResponse[];
  topStocks: StockApiResponse[];
  recentTransactions: Transaction[];
}
