"use server";

import { TokenPair } from "@/apiRequests/auth/login.api";
import { AUTHENTICATION_COOKIE } from "@/app/(auth)/auth-cookie";

import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

export const setCookieLocal = (value: TokenPair) => {
  const accessToken = value.access_token;
  const expires = new Date(jwtDecode(accessToken).exp! * 1000);
  cookies().set({
    name: AUTHENTICATION_COOKIE,
    value: JSON.stringify(value),
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    expires,
  });
};
