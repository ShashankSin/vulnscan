import { lazy } from "react";

import LazyWrapper from "../components/ui/LazyWrapper";
import RouteError from "./RouteError";
import PublicRoute from "./Public";

// lazy loaded pages
const LandingPage = lazy(() => import("../pages/landing"));
const LoginPage = lazy(() => import("../pages/Auth/login"));
const RegisterPage = lazy(() => import("../pages/Auth/register"));
const NotFoundPage = lazy(() => import("../pages/notFound"));

const CommonRoutes = [
  {
    element: <PublicRoute />,
    errorElement: <RouteError />,
    children: [
      {
        path: "/",
        element: <LazyWrapper Component={LandingPage} />,
      },
      {
        path: "login",
        element: <LazyWrapper Component={LoginPage} />,
      },
      {
        path: "register",
        element: <LazyWrapper Component={RegisterPage} />,
      },
      {
        path: "*",
        element: <LazyWrapper Component={NotFoundPage} />,
      },
    ],
  },
];

export { CommonRoutes };
