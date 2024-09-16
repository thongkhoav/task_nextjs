"use client";

import { loginApi, TokenPair } from "@/apiRequests/auth/login.api";
import { NextUIProvider } from "@nextui-org/react";
import { useCallback, useContext, useEffect, useState } from "react";

import { createContext } from "react";
import { jwtDecode } from "jwt-decode";
import ToastProvider from "./toast-provider";
import { clearCookieLocal, setCookieLocal } from "../common/util/cookie-action";
import useAxiosPrivate from "../common/util/axios/useAxiosPrivate";
import { ToastError, ToastSuccess } from "../common/util/toast";
import { CircleUserRound, LogOut, UserRound } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

export enum RoleType {
  ADMIN = "ADMIN",
  USER = "USER",
}

type User = {
  sub: string;
  email: string;
  fullName: string;
  role: RoleType;
};

const AppContext = createContext<{
  user: User | null;
  setUser: (user: TokenPair | null) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
});

export const useAppContext = () => {
  const context = useContext(AppContext);
  return context;
};

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUserState] = useState<User | null>(() => {
    // if (isClient()) {
    //   const _user = localStorage.getItem('user')
    //   return _user ? JSON.parse(_user) : null
    // }
    return null;
  });
  const isAuthenticated = Boolean(user);
  const axiosPrivate = useAxiosPrivate();
  const router = useRouter();

  const setUser = useCallback((tokens: TokenPair | null) => {
    if (tokens) {
      localStorage.setItem("task_user", JSON.stringify(tokens));
      const decodedToken: any = jwtDecode(tokens?.access_token);
      if (decodedToken) {
        const user = {
          sub: decodedToken.sub,
          email: decodedToken.email,
          fullName: decodedToken.fullName,
          role: decodedToken.role,
        };
        setUserState(user);
        return;
      }
    }
    localStorage.removeItem("task_user");
    setUserState(null);
  }, []);
  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) return;

    const response = await loginApi(email, password);
    if (response) {
      const { data } = response;
      const decodedToken: any = jwtDecode(data?.access_token);
      if (decodedToken) {
        const newUser = {
          sub: decodedToken.sub,
          email: decodedToken.email,
          fullName: decodedToken.fullName,
          role: decodedToken.role,
        };
        localStorage.setItem("task_user", JSON.stringify(data));
        console.log(newUser);

        setUserState(newUser);
        setCookieLocal(data);
      } else {
        setUserState(null);
      }
    }
  };

  const handleLogout = async () => {
    try {
      const task_user = localStorage.getItem("task_user");
      const tokens = task_user ? JSON.parse(task_user) : null;
      if (tokens) {
        await axiosPrivate.post("/auth/logout", tokens);
        setUserState(null);
        localStorage.removeItem("task_user");
        clearCookieLocal();
        ToastSuccess("Sign out success");
        router.push("/login");
        router.refresh();
      }
    } catch (error: any) {
      console.log(error);
      ToastError(error.message);
    }
  };

  useEffect(() => {
    const task_user = localStorage.getItem("task_user");
    const tokens = task_user ? JSON.parse(task_user) : null;
    if (tokens) {
      const decodedToken: any = jwtDecode(tokens?.access_token);
      if (decodedToken) {
        const newUser = {
          sub: decodedToken.sub,
          email: decodedToken.email,
          fullName: decodedToken.fullName,
          role: decodedToken.role,
        };
        console.log(newUser);

        setUserState(newUser);
        return;
      }
    }
    setUserState(null);
  }, [setUserState]);
  return (
    <ToastProvider>
      <NextUIProvider>
        <AppContext.Provider
          value={{
            user,
            setUser,
            isAuthenticated,
            login: handleLogin,
            logout: handleLogout,
          }}
        >
          {user && isAuthenticated && (
            <div className="w-full flex justify-center mt-5">
              <div className="flex justify-between gap-5 px-5 min-w-80 py-2 bg-slate-200 rounded-md">
                <div className="text-lg font-bold flex items-center gap-1">
                  <CircleUserRound />
                  {user.fullName}
                </div>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={handleLogout}>
                        <LogOut size={25} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sign out</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}
          {children}
        </AppContext.Provider>
      </NextUIProvider>
    </ToastProvider>
  );
}
