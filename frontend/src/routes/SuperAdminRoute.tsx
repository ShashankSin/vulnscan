import AdministratorProtectedRoute from "./AdministratorProtectedRoutes";
import RouteError from "./RouteError";
import { lazy } from "react";
import LazyWrapper from "@/components/ui/LazyWrapper";
import DashboardLayout from "@/components/dashboard";

const NotFoundRoute = lazy(() => import("../pages/notFound"));
const AdminDashboard = lazy(() => import("../pages/admin/dashboard"));
const UsersPage = lazy(() => import("../pages/admin/users"));
const ScansPage = lazy(() => import("../pages/admin/scan"));
const ReportsPage = lazy(() => import("../pages/admin/report"));
const AnalyticsPage = lazy(() => import("../pages/admin/analytics"));

const SuperAdmin = [
  {
    element: <AdministratorProtectedRoute />,
    errorElement: <RouteError />,
    children: [
      {
        path: "/admin",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <LazyWrapper Component={AdminDashboard} />,
          },
          {
            path: "users",
            element: <LazyWrapper Component={UsersPage} />,
          },
          {
            path: "scans",
            element: <LazyWrapper Component={ScansPage} />,
          },
          {
            path: "reports",
            element: <LazyWrapper Component={ReportsPage} />,
          },
          {
            path: "analytics",
            element: <LazyWrapper Component={AnalyticsPage} />,
          },
          {
            path: "*",
            element: <LazyWrapper Component={NotFoundRoute} />,
          },
        ],
      },
    ],
  },
];

export default SuperAdmin;
