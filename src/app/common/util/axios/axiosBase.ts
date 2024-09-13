import axios from "axios";

export const axiosBase = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_HOST + "/api/v1",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
