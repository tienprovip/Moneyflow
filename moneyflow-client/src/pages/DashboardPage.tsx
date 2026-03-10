import AllocationChart from "@/components/dashboard/AllocationChart";
import AssetCards from "@/components/dashboard/AssetCards";
import GreetingHeader from "@/components/dashboard/GreetingHeader";
import NetWorthChart from "@/components/dashboard/NetWorthChart";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <GreetingHeader />
      <AssetCards />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="lg:col-span-3">
          <NetWorthChart />
        </div>
        <div className="lg:col-span-2">
          <AllocationChart />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
