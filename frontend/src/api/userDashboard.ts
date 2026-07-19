import API_ENDPOINTS from "@/lib/endPoints";
import API from "@/request/request";
import { useQuery } from "@tanstack/react-query";

export const DASHBOARD_KEYS = {
  all: ["dashboard"] as const,
  userStats: () => [...DASHBOARD_KEYS.all, "userStats"] as const,
  recentScans: () => [...DASHBOARD_KEYS.all, "recentScans"] as const,
} as const;

export const dashboardAPI = {
  getUserStats: async () => {
    const { data } = await API.get(API_ENDPOINTS.DASHBOARD.USER_STATS);
    return data;
  },
  getRecentScans: async () => {
    const { data } = await API.get(API_ENDPOINTS.DASHBOARD.RECENT_SCANS);
    return data;
  },
} as const;

const useUserStats = () => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.userStats(),
    queryFn: dashboardAPI.getUserStats,
    meta: { errorMessage: "Failed to fetch user statistics" },
  });
};

const useRecentScans = () => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.recentScans(),
    queryFn: dashboardAPI.getRecentScans,
    meta: { errorMessage: "Failed to fetch recent scans" },
  });
};

export const USERDASHBOARDAPI = {
  useUserStats,
  useRecentScans,
};
