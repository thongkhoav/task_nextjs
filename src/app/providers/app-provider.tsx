"use client";

import { loginApi, TokenPair } from "@/apiRequests/auth/login.api";
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
    setUserState(null);
    localStorage.removeItem("task_user");
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
          {children}
        </AppContext.Provider>
      </NextUIProvider>
    </ToastProvider>
  );
}
