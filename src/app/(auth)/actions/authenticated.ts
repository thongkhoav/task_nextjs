import { cookies } from "next/headers";
import { AUTHENTICATION_COOKIE } from "../auth-cookie";

export default async function authenticated() {
  console.log(
    "check authenticate",
    cookies().get(AUTHENTICATION_COOKIE)?.value
  );
  return !!cookies().get(AUTHENTICATION_COOKIE)?.value;
}
