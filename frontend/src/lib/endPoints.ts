// Authentication Endpoints
export const AUTH_ENDPOINTS = {
  REGISTER: `/auth/register`,
  LOGIN: `/auth/login`,
} as const;

export const SCAN_ENDPOINTS = {
  START_STREAM: (url: string) => `/scan/stream?url=${encodeURIComponent(url)}`,
  LIST: `/scan`,
  DETAIL: (id: string) => `/scan/${id}`,
} as const;

export const DASHBOARD_ENDPOINTS = {
  USER_STATS: `/dashboard`,
  RECENT_SCANS: `/scans/recent`,
} as const;

// All endpoints combined for easy access
export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  SCAN: SCAN_ENDPOINTS,
  DASHBOARD: DASHBOARD_ENDPOINTS,
} as const;

export default API_ENDPOINTS;
