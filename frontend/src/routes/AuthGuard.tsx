import { fetchToken } from "@/lib/storage";
import { Navigate, Outlet } from "react-router-dom";

const AuthGuard = () => {
  const token = fetchToken();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
