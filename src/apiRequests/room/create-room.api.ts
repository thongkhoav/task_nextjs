import { axiosBase } from "@/app/common/util/axios/axiosBase";
import { AxiosInstance } from "axios";
export interface CreateRoomDto {
  name: string;
  description: string;
}

export const loginApi = async (
  axiosPrivate: AxiosInstance,
  dto: CreateRoomDto
) => {
  return await axiosPrivate.post("/room", dto);
};
