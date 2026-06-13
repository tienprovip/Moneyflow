import { AllocationChart } from "@/components/dashboard/AllocationChart";
import { AssetCards } from "@/components/dashboard/AssetCards";
import { GoldSection } from "@/components/dashboard/GoldSection";
import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { NetWorthChart } from "@/components/dashboard/NetWorthChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { StockTable } from "@/components/dashboard/StockTable";
import { TopSpending } from "@/components/dashboard/TopSpending";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDashboard } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardPage = () => {
  const { data, isLoading } = useDashboard();

  const totalNetWorth = data 
    ? data.assets.cash.value + data.assets.stocks.value + data.assets.gold.value 
    : 0;

  return (
    <DashboardLayout>
      <GreetingHeader totalNetWorth={totalNetWorth} />

      {isLoading || !data ? (
        <div className="space-y-4 sm:space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Skeleton className="h-[120px] rounded-lg" />
            <Skeleton className="h-[120px] rounded-lg" />
            <Skeleton className="h-[120px] rounded-lg" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Skeleton className="lg:col-span-3 h-[300px] rounded-lg" />
            <Skeleton className="lg:col-span-2 h-[300px] rounded-lg" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Skeleton className="h-[300px] rounded-lg" />
            <Skeleton className="h-[300px] rounded-lg" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <Skeleton className="h-[300px] rounded-lg" />
            <Skeleton className="h-[300px] rounded-lg" />
          </div>
        </div>
      ) : (
        <>
          <AssetCards data={data.assets} />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="lg:col-span-3">
              <NetWorthChart data={data.netWorthChart} />
            </div>
            <div className="lg:col-span-2">
              <AllocationChart data={data.allocation} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <TopSpending data={data.topSpending} />
            <GoldSection data={data.goldHoldings} trend={data.goldTrend} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <StockTable data={data.topStocks} />
            <RecentTransactions data={data.recentTransactions} />
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default DashboardPage;
