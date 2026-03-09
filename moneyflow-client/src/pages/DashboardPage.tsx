import AssetCards from "@/components/dashboard/AssetCards";
import GreetingHeader from "@/components/dashboard/GreetingHeader";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import React from "react";

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <GreetingHeader />
      <AssetCards />
    </DashboardLayout>
  );
};

export default DashboardPage;
