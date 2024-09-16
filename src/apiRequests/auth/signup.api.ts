import { axiosBase } from "@/app/common/util/axios/axiosBase";

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
}
export const signupApi = async (data: SignUpData) => {
  return axiosBase.post("/auth/signup", data);
};
