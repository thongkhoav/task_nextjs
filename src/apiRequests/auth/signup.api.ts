import axiosInstance from "@/app/common/util/axios/axiosInstance";
export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
}
export const signupApi = async (data: SignUpData) => {
  return axiosInstance.post("/auth/signup", data);
};
