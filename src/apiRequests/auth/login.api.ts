import { axiosBase } from "@/app/common/util/axios/axiosBase";
import { AxiosInstance } from "axios";
export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export const loginApi = async (email: string, password: string) => {
  return await axiosBase.post<TokenPair>("/auth/signin", {
    email,
    password,
  });
};
