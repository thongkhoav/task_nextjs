"use server";

import { cookies } from "next/headers";
import { AUTHENTICATION_COOKIE } from "../auth-cookie";

export default async function getAuthentication() {
  const data = cookies().get(AUTHENTICATION_COOKIE);
  return JSON.parse(data?.value || "{}");
}
