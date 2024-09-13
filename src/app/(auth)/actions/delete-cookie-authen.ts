"use server";

import { cookies } from "next/headers";
import { AUTHENTICATION_COOKIE } from "../auth-cookie";

export default async function deleteCookieAuthen() {
  return cookies().delete(AUTHENTICATION_COOKIE);
}
