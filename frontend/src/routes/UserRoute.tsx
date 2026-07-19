import RouteError from "./RouteError";
import { lazy } from "react";
import LazyWrapper from "@/components/ui/LazyWrapper";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "@/components/dashboard";

const NotFoundRoute = lazy(() => import("../pages/notFound"));
const UserDashboard = lazy(() => import("../pages/user/index"));
const SettingsPage = lazy(() => import("../pages/user/settings"));
const ScansPage = lazy(() => import("../pages/user/scans"));
const ScanDetails = lazy(() => import("../pages/user/scans/ScanDetails"));
const UserRoute = [
  {
    element: <ProtectedRoute />,
    errorElement: <RouteError />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <LazyWrapper Component={UserDashboard} />,
          },
          {
            path: "scans",
            element: <LazyWrapper Component={ScansPage} />,
          },
          {
            path: "scans/:id",
            element: <LazyWrapper Component={ScanDetails} />,
          },
          {
            path: "settings",
            element: <LazyWrapper Component={SettingsPage} />,
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

export default UserRoute;
