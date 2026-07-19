import { USERAUTHAPI } from "@/api/auth";
import { saveUser } from "@/lib/storage";
import type { LoginInput, RegisterInput } from "@/lib/validationSchema";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { setUserInfo } from "./useUserStorage";

const useLoginHandler = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: login, isPending } = USERAUTHAPI.useUserLogin();
  const { mutate: register, isPending: isRegistering } =
    USERAUTHAPI.useUserRegister();
  const handleLogin = (data: LoginInput) => {
    login(data, {
      onSuccess: (response) => {
        const accessToken = response?.token;
        const user = response?.user;
        if (!accessToken || !user) {
          toast.error("Login failed. Please try again.");
          return;
        }
        saveUser(accessToken);
        setUserInfo(user);
        queryClient.setQueryData(["authToken"], accessToken);
        toast.success(response.message);
        const isAdmin = user.roles?.includes("SuperAdmin");
        navigate(isAdmin ? "/administrator/dashboard" : "/dashboard", {
          replace: true,
        });
      },
    });
  };

  const handleRegister = (data: RegisterInput) => {
    register(data, {
      onSuccess: (response) => {
        toast.success(response.message);
        navigate("/", { replace: true });
      },
    });
  };

  return { handleLogin, handleRegister, isPending, isRegistering };
};

export { useLoginHandler };
