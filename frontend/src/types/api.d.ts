export type LoginResponse = {
  token: string;
  message: string;
  code: string;
  user: {
    name: string;
    userName: string;
    roles?: string[];
  };
};

export type RegisterResponse = {
  message: string;
  code: string;
  data: Omit<LoginResponse["data"], "accessToken">;
};

export type UserResponse = {
  message: string;
  code: string;
  data: User;
};

export interface DashboardStats {
  totalScans: number;
  criticalThreats: number;
  successRate: number;
  avgScanTime: string;
}

export interface RecentScan {
  id: string;
  domain: string;
  status: string;
  threats: number;
  date: string;
}
