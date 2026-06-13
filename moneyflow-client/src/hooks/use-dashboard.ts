import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { queryKeys } from "@/lib/query-keys";
import { DashboardSummaryResponse } from "@/types/dashboard";

const fetchDashboardSummary = async (): Promise<DashboardSummaryResponse> => {
  const { data } = await axiosInstance.get<DashboardSummaryResponse>("/dashboard/summary");
  return data;
};

export const useDashboard = () => {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: fetchDashboardSummary,
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
    refetchOnWindowFocus: true, // Refresh data when switching back to the app to ensure dashboard is fresh
  });
};
