import { fetchToken } from "@/lib/storage";
import { useNavigate, Outlet } from "react-router-dom";
import { useEffect, useMemo } from "react";

import MainLoader from "@/components/common/MainLoader";
import { getUserRoleFromToken } from "@/lib/useUserStorage";

const AdministratorProtectedRoute = () => {
  const navigate = useNavigate();

  const token = fetchToken();
  const role = getUserRoleFromToken();

  const isCheckingAuth = !role;

  const isAuthorized = useMemo(() => {
    if (!token || !role) return false;

    // allow only SuperAdmin or User
    if (role === "superadmin" || role === "User") {
      return true;
    }

    return false;
  }, [token, role]);

  useEffect(() => {
    if (!isCheckingAuth && !isAuthorized) {
      navigate("/", { replace: true });
    }
  }, [isCheckingAuth, isAuthorized, navigate]);

  if (isCheckingAuth) {
    return <MainLoader />;
  }

  if (!isAuthorized) {
    return null;
  }

  return <Outlet />;
};

export default AdministratorProtectedRoute;
