"use client";

import { loginApi } from "@/apiRequests/auth/login.api";
import { NextUIProvider } from "@nextui-org/react";
import { useCallback, useContext, useEffect, useState } from "react";

import { createContext } from "react";
import { jwtDecode } from "jwt-decode";
import ToastProvider from "./toast-provider";
import { setCookieLocal } from "../common/util/cookie-action";

export enum RoleType {
  ADMIN = "ADMIN",
  USER = "USER",
}

type User = {
  id: number;
  email: string;
  fullName: string;
  role: RoleType;
};

const AppContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
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
  const setUser = useCallback(
    (user: User | null) => {
      setUserState(user);
      localStorage.setItem("user", JSON.stringify(user));
    },
    [setUserState]
  );
  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) return;

    const response = await loginApi(email, password);
    if (response) {
      const { data } = response;
      const decodedToken: any = jwtDecode(data?.access_token);
      if (decodedToken) {
        const user = {
          id: decodedToken.id,
          email: decodedToken.email,
          fullName: decodedToken.fullName,
          role: decodedToken.role,
        };
        setUser(user);
        setCookieLocal(data);
      } else {
        setUser(null);
      }
    }
  };

  const handleLogout = async () => {
    setUser(null);
    localStorage.removeItem("task_user");
  };

  useEffect(() => {
    const _user = localStorage.getItem("user");
    setUserState(_user ? JSON.parse(_user) : null);
  }, [setUserState]);
  return (
    <ToastProvider>
      <NextUIProvider>
        <AppContext.Provider
          value={{
            user: null,
            setUser,
            isAuthenticated,
            login: handleLogin,
            logout: handleLogout,
          }}
        >
          {children}
        </AppContext.Provider>
      </NextUIProvider>
    </ToastProvider>
  );
}
